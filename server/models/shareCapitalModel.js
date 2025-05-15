const db = require('../config/db'); // Adjust path as needed

exports.createShareCapitalTransaction = async (transactionData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const {
      memberCode,
      transaction_type,
      amount,
      transferToMemberCode,
      description,
      authorized_by,
      transaction_number
    } = transactionData;

    // Input validation
    if (!memberCode || !transaction_type || !amount) {
      throw new Error('Missing required fields: memberCode, transaction_type, and amount are required');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (transaction_type === 'transfer' && !transferToMemberCode) {
      throw new Error('transferToMemberCode is required for transfer transactions');
    }

    // Get memberId from memberCode
    const [member] = await connection.execute(
      'SELECT memberId FROM members WHERE memberCode = ?',
      [memberCode]
    );

    if (!member.length) {
      throw new Error('Member not found');
    }

    const memberId = member[0].memberId;

    // For transfers, validate target member
    if (transaction_type === 'transfer') {
      const [targetMember] = await connection.execute(
        'SELECT memberId FROM members WHERE memberCode = ?',
        [transferToMemberCode]
      );

      if (!targetMember.length) {
        throw new Error('Target member not found');
      }
    }

    // Insert transaction record
    const sql = `
      INSERT INTO share_capital_transactions (
        memberCode,
        transaction_type,
        amount,
        transferToMemberCode,
        description,
        authorized_by,
        transaction_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(sql, [
      memberCode,
      transaction_type,
      amount,
      transferToMemberCode || null,
      description || null,
      authorized_by || null,
      transaction_number || null
    ]);

    // Handle share capital updates based on transaction type
    if (transaction_type === 'deposit') {
      // Check if member exists in share_capital table
      const [memberExists] = await connection.execute(
        `SELECT COUNT(*) as count FROM share_capital WHERE memberId = ?`,
        [memberId]
      );

      if (memberExists[0].count === 0) {
        // Insert new record if member doesn't exist
        await connection.execute(
          `INSERT INTO share_capital (memberId, total_amount) VALUES (?, ?)`,
          [memberId, amount]
        );
      } else {
        // Update existing record
        await connection.execute(
          `UPDATE share_capital SET total_amount = total_amount + ? WHERE memberId = ?`,
          [amount, memberId]
        );
      }
    } 
    else if (transaction_type === 'withdraw') {
      // Check if member has sufficient balance
      const [balanceCheck] = await connection.execute(
        `SELECT total_amount FROM share_capital WHERE memberId = ?`,
        [memberId]
      );
      
      if (!balanceCheck.length || parseFloat(balanceCheck[0].total_amount) < parseFloat(amount)) {
        throw new Error('Insufficient share capital balance');
      }
      
      await connection.execute(
        `UPDATE share_capital SET total_amount = total_amount - ? WHERE memberId = ?`,
        [amount, memberId]
      );
    }
    else if (transaction_type === 'transfer') {
      // Get target memberId
      const [targetMember] = await connection.execute(
        'SELECT memberId FROM members WHERE memberCode = ?',
        [transferToMemberCode]
      );
      const targetMemberId = targetMember[0].memberId;

      // Check if source member has sufficient balance
      const [balanceCheck] = await connection.execute(
        `SELECT total_amount FROM share_capital WHERE memberId = ?`,
        [memberId]
      );
      
      if (!balanceCheck.length || parseFloat(balanceCheck[0].total_amount) < parseFloat(amount)) {
        throw new Error('Insufficient share capital balance for transfer');
      }

      // Decrease source member's share capital
      await connection.execute(
        `UPDATE share_capital SET total_amount = total_amount - ? WHERE memberId = ?`,
        [amount, memberId]
      );

      // Check if target member has share_capital record
      const [targetShareCheck] = await connection.execute(
        `SELECT COUNT(*) as count FROM share_capital WHERE memberId = ?`,
        [targetMemberId]
      );

      if (targetShareCheck[0].count === 0) {
        // Create share_capital record for target member
        await connection.execute(
          `INSERT INTO share_capital (memberId, total_amount) VALUES (?, ?)`,
          [targetMemberId, amount]
        );
      } else {
        // Update target member's share capital
        await connection.execute(
          `UPDATE share_capital SET total_amount = total_amount + ? WHERE memberId = ?`,
          [amount, targetMemberId]
        );
      }
    }
    
    await connection.commit();
    
    return {
      success: true,
      transaction_id: result.insertId,
      transaction_number: transaction_number,
      message: "Share capital transaction created successfully"
    };
  } catch (err) {
    await connection.rollback();
    console.error("Share capital transaction error:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

exports.getShareCapitalByMemberId = async (memberId) => {
  try {
    // 1) Fetch all the member fields (including share_capital) and join with regular_savings
    const [memberRows] = await db.execute(
      `SELECT 
         m.memberCode,
         m.first_name,
         m.last_name,
         m.member_type,
         m.id_picture,
         sc.total_amount
       FROM members m
       LEFT JOIN share_capital sc ON m.memberId = sc.memberId
       WHERE m.memberId = ?`,
      [memberId]
    );

    if (!memberRows.length) {
      throw new Error("Member not found");
    }

    const member = memberRows[0];
    const memberCode = member.memberCode;
    const totalShareCapital = parseFloat(member.total_amount) || 0;

    // 2) Fetch that member's share‑capital transactions
    const [transactions] = await db.execute(
      `SELECT 
         id,
         memberCode,
         transaction_number,
         transaction_type,
         amount,
         transferToMemberCode,
         authorized_by,
         transaction_date,
         description
       FROM share_capital_transactions
       WHERE memberCode = ? OR transferToMemberCode = ?
       ORDER BY transaction_date DESC`,
      [memberCode, memberCode]
    );

    // 3) Return everything in one payload
    return {
      success: true,
      total_share_capital: totalShareCapital,
      transactions: transactions,
      member: {
        memberCode,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        amount: member.amount,
        authorized_by: member.authorized_by,
        member_type: member.member_type,
        id_picture: member.id_picture
      }
    };
  } catch (err) {
    console.error("Error fetching share capital:", err.message);
    throw err;
  }
};
  

  exports.getAllShareCapitalTransactions = async () => {
    try {
      const [transactions] = await db.execute(`
        SELECT sct.*, 
               source.firstName as sourceFirstName, 
               source.lastName as sourceLastName,
               target.firstName as targetFirstName, 
               target.lastName as targetLastName,
               sct.authorized_by as authorized_by
        FROM share_capital_transactions sct
        JOIN members source ON sct.memberCode = source.memberCode
        LEFT JOIN members target ON sct.transferToMemberCode = target.memberCode
        ORDER BY sct.transaction_date DESC
      `);
      
      return {
        success: true,
        transactions: transactions
      };
    } catch (err) {
      console.error("Error fetching all share capital transactions:", err.message);
      throw err;
    }
  };

// Generate a unique transaction reference ID (if needed)
exports.generateTransactionReference = async () => {
  try {
    const [result] = await db.execute(
      `SELECT COUNT(*) as count FROM share_capital_transactions WHERE YEAR(transaction_date) = YEAR(CURRENT_DATE())`
    );
    
    const count = result[0].count + 1;
    const year = new Date().getFullYear();
    const referenceNumber = `SC-${year}-${String(count).padStart(4, '0')}`;
    
    return referenceNumber;
  } catch (err) {
    console.error("Error generating transaction reference:", err.message);
    throw err;
  }

  
};