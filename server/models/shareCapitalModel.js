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
      description
    } = transactionData;
    
    const sql = `
      INSERT INTO share_capital_transactions (
        memberCode,
        transaction_type,
        amount,
        transferToMemberCode,
        description
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(sql, [
      memberCode,
      transaction_type,
      amount,
      transferToMemberCode || null,
      description || null
    ]);
    
    // Update the source member's share capital
    let updateMemberSql = '';
    
    if (transaction_type === 'deposit') {
      updateMemberSql = `
        UPDATE members 
        SET share_capital = share_capital + ? 
        WHERE memberCode = ?
      `;
      await connection.execute(updateMemberSql, [amount, memberCode]);
    } 
    else if (transaction_type === 'withdraw') {
      updateMemberSql = `
        UPDATE members 
        SET share_capital = share_capital - ? 
        WHERE memberCode = ?
      `;
      await connection.execute(updateMemberSql, [amount, memberCode]);
    }
    else if (transaction_type === 'transfer') {
      // Decrease source member's share capital
      updateMemberSql = `
        UPDATE members 
        SET share_capital = share_capital - ? 
        WHERE memberCode = ?
      `;
      await connection.execute(updateMemberSql, [amount, memberCode]);
      
      // Increase target member's share capital
      const updateTargetSql = `
        UPDATE members 
        SET share_capital = share_capital + ? 
        WHERE memberCode = ?
      `;
      await connection.execute(updateTargetSql, [amount, transferToMemberCode]);
    }
    
    await connection.commit();
    
    return {
      success: true,
      transaction_id: result.insertId,
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

exports.createShareCapitalTransaction = async (transactionData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      const {
        memberCode,
        transaction_type,
        amount,
        transferToMemberCode,
        authorized_by,
        description,
        transaction_number
      } = transactionData;
      
      const sql = `
        INSERT INTO share_capital_transactions (
          memberCode,
          transaction_type,
          amount,
          transferToMemberCode,
          authorized_by,
          description,
          transaction_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(sql, [
        memberCode,
        transaction_type,
        amount,
        transferToMemberCode || null,
        authorized_by || null,
        description || null,
        transaction_number || null
      ]);
      
      // Update the source member's share capital
      let updateMemberSql = '';
      
      if (transaction_type === 'deposit') {
        updateMemberSql = `
          UPDATE share_capital 
          SET total_amount = total_amount + ? 
          WHERE memberCode = ?
        `;
        await connection.execute(updateMemberSql, [amount, memberCode]);
      } 
      else if (transaction_type === 'withdraw') {
        // Check if member has sufficient balance before withdrawal
        const [balanceCheck] = await connection.execute(
          `SELECT total_amount FROM share_capital WHERE memberCode = ?`,
          [memberCode]
        );
        
        if (!balanceCheck.length || parseFloat(balanceCheck[0].total_amount) < parseFloat(amount)) {
          throw new Error("Insufficient share capital balance for withdrawal");
        }
        
        updateMemberSql = `
          UPDATE share_capital 
          SET total_amount = total_amount - ? 
          WHERE memberCode = ?
        `;
        await connection.execute(updateMemberSql, [amount, memberCode]);
      }
      else if (transaction_type === 'transfer') {
        // Check if source member has sufficient balance before transfer
        const [balanceCheck] = await connection.execute(
          `SELECT total_amount FROM share_capital WHERE memberCode = ?`,
          [memberCode]
        );
        
        if (!balanceCheck.length || parseFloat(balanceCheck[0].total_amount) < parseFloat(amount)) {
          throw new Error("Insufficient share capital balance for transfer");
        }
        
        // Check if target member exists
        const [targetCheck] = await connection.execute(
          `SELECT COUNT(*) as count FROM members WHERE memberCode = ?`,
          [transferToMemberCode]
        );
        
        if (targetCheck[0].count === 0) {
          throw new Error("Target member does not exist");
        }
        
        // Decrease source member's share capital
        updateMemberSql = `
          UPDATE share_capital 
          SET total_amount = total_amount - ? 
          WHERE memberCode = ?
        `;
        await connection.execute(updateMemberSql, [amount, memberCode]);
        
        // Increase target member's share capital
        const updateTargetSql = `
          UPDATE share_capital 
          SET total_amount = total_amount + ? 
          WHERE memberCode = ?
        `;
        await connection.execute(updateTargetSql, [amount, transferToMemberCode]);
        
        // Check if this was a full transfer (all share capital transferred)
        // If full transfer, update member status to inactive
        if (Math.abs(parseFloat(balanceCheck[0].total_amount) - parseFloat(amount)) < 0.01) {
          const updateMemberStatusSql = `
            UPDATE members 
            SET status = 'inactive' 
            WHERE memberCode = ?
          `;
          await connection.execute(updateMemberStatusSql, [memberCode]);
        }
      }
      else if (transaction_type === 'dividend') {
        updateMemberSql = `
          UPDATE share_capital 
          SET total_amount = total_amount + ? 
          WHERE memberCode = ?
        `;
        await connection.execute(updateMemberSql, [amount, memberCode]);
      }
      else {
        // For any other transaction types, log but don't modify balances
        console.log(`Transaction type '${transaction_type}' does not affect share capital balance.`);
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