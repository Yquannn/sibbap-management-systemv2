const db = require("../config/db");
const { generateAccountNumber, generateTransactionNumber } = require("../utils/generateTransactionNumber");

const TimeDeposit = {
  create: async ({
    memberId,
    account_number = generateAccountNumber(),
    amount,
    fixedTerm,
    interest_rate,
    interest,
    payout,
    maturityDate,
    authorized_by,
    user_type,
    account_type,
    co_last_name,
    co_middle_name,
    co_first_name,
    co_extension_name,
    co_date_of_birth,
    co_place_of_birth,
    co_age,
    co_gender,
    co_civil_status,
    co_contact_number,
    co_relationship_primary,
    co_complete_address
  }) => {
    try {
      await db.beginTransaction();

      const sql = `
        INSERT INTO time_deposit (
          memberId, account_number, amount, fixedTerm, interest_rate, interest, 
          payout, maturityDate, account_status, account_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        memberId,
        account_number,
        amount,
        fixedTerm,
        interest_rate,
        interest,
        payout,
        maturityDate,
        "PRE-MATURE",
        account_type,
      ];

      const [result] = await db.execute(sql, params);
      const timeDepositId = result.insertId;

      if (co_last_name || co_first_name) {
        const coSql = `
          INSERT INTO time_deposit_co_makers (
            time_deposit_id, co_last_name, co_middle_name, co_first_name, 
            co_extension_name, co_date_of_birth, co_place_of_birth, co_age, 
            co_gender, co_civil_status, co_contact_number, 
            co_relationship_primary, co_complete_address
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const coParams = [
          timeDepositId,
          co_last_name,
          co_middle_name,
          co_first_name,
          co_extension_name,
          co_date_of_birth,
          co_place_of_birth,
          co_age,
          co_gender,
          co_civil_status,
          co_contact_number,
          co_relationship_primary,
          co_complete_address,
        ];
        
        await db.execute(coSql, coParams);
      }

      const transactionResult = await TimeDeposit.createTimeDepositTransaction({
        time_deposit_id: timeDepositId,
        transaction_number: generateTransactionNumber(),
        transaction_date_time: new Date(),
        transaction_type: "Deposit",
        amount,
        authorized_by: authorized_by || "System",
        user_type: user_type || "System",
        remarks: "Initial deposit"
      });

      await db.commit();
      return { depositResult: result, transactionResult };
    } catch (error) {
      await db.rollback();
      throw error;
    }
  },

  createTimeDepositTransaction: async ({
    time_deposit_id,
    transaction_number = generateTransactionNumber(),
    transaction_date_time = new Date(),
    transaction_type,
    amount,
    authorized_by,
    user_type,
    remarks
  }) => {
    const sql = `
      INSERT INTO time_deposit_transactions (
        time_deposit_id, transaction_number, transaction_date_time, 
        transaction_type, amount, authorized_by, \`user_type\`, remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      time_deposit_id,
      transaction_number,
      transaction_date_time,
      transaction_type,
      amount,
      authorized_by,
      user_type,
      remarks
    ];
    const [result] = await db.execute(sql, params);
    return result;
  },

  getAllActive: async () => {
    const sql = `
      SELECT 
        td.*, 
        m.memberId, 
        m.last_name, 
        m.first_name, 
        m.memberCode,
        COALESCE(r.rollover_count, 0) as rollover_count
      FROM 
        time_deposit td
      INNER JOIN 
        members m ON td.memberId = m.memberId
      LEFT JOIN (
        SELECT timeDepositId, COUNT(*) as rollover_count 
        FROM time_deposit_rollovers 
        GROUP BY timeDepositId
      ) r ON td.timeDepositId = r.timeDepositId
      WHERE td.account_status NOT IN ('CLOSED', 'TERMINATED')
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  getTimeDepositorById: async (id) => {
    try {
      const sql = `
        SELECT 
          td.*,
          m.*,
          co_maker.*,
          r.rollover_id,
          r.rollover_date,
          r.previous_maturity_date AS rollover_previous_maturity_date,
          r.new_maturity_date AS rollover_new_maturity_date,
          r.interest_earned AS rollover_interest_earned,
          r.rollover_amount,
          r.created_at AS rollover_created_at,
          r.updated_at AS rollover_updated_at,
          r.created_by AS rollover_created_by,
          tdt.transaction_number,
          tdt.transaction_date_time,
          tdt.transaction_type,
          tdt.amount as transaction_amount,
          tdt.authorized_by as transaction_authorized_by,
          tdt.remarks as transaction_remarks
        FROM time_deposit td
        INNER JOIN members m ON td.memberId = m.memberId
        LEFT JOIN time_deposit_co_makers co_maker ON td.timeDepositId = co_maker.time_deposit_id
        LEFT JOIN time_deposit_rollovers r ON td.timeDepositId = r.timeDepositId
        LEFT JOIN time_deposit_transactions tdt ON td.timeDepositId = tdt.time_deposit_id
        WHERE td.timeDepositId = ?
        ORDER BY r.created_at DESC, tdt.transaction_date_time DESC
      `;

      const [rows] = await db.execute(sql, [id]);
      
      if (rows.length === 0) {
        throw new Error('No deposit found with the provided ID');
      }

      const firstRow = rows[0];

      // Process transactions history
      const transactions = rows
        .filter(row => row.transaction_number)
        .map(row => ({
          transaction_number: row.transaction_number,
          transaction_date_time: row.transaction_date_time,
          transaction_type: row.transaction_type,
          amount: row.transaction_amount,
          authorized_by: row.transaction_authorized_by,
          remarks: row.transaction_remarks
        }));

      // Process rollover history
      const rollovers = rows
        .filter(row => row.rollover_id)
        .map(row => ({
          rollover_id: row.rollover_id,
          timeDepositId: row.timeDepositId,
          rollover_date: row.rollover_date,
          previous_maturity_date: row.rollover_previous_maturity_date,
          new_maturity_date: row.rollover_new_maturity_date,
          interest_earned: row.rollover_interest_earned,
          rollover_amount: row.rollover_amount,
          created_at: row.rollover_created_at,
          updated_at: row.rollover_updated_at,
          created_by: row.rollover_created_by
        }));

      return {
        timeDeposit: {
          timeDepositId: firstRow.timeDepositId,
          memberId: firstRow.memberId,
          account_number: firstRow.account_number,
          amount: firstRow.amount,
          fixedTerm: firstRow.fixedTerm,
          interest_rate: firstRow.interest_rate,
          interest: firstRow.interest,
          payout: firstRow.payout,
          maturityDate: firstRow.maturityDate,
          account_status: firstRow.account_status,
          account_type: firstRow.account_type
        },
        member: {
          last_name: firstRow.last_name,
          first_name: firstRow.first_name,
          memberCode: firstRow.memberCode,
          contact_number: firstRow.contact_number,
          date_of_birth: firstRow.date_of_birth,
          member_type: firstRow.member_type,
          civil_status: firstRow.civil_status,
          house_no_street: firstRow.house_no_street,
          barangay: firstRow.barangay,
          city: firstRow.city,
        },
        coMaker: firstRow.co_maker_id
          ? {
              co_maker_id: firstRow.co_maker_id,
              co_last_name: firstRow.co_last_name,
              co_middle_name: firstRow.co_middle_name,
              co_first_name: firstRow.co_first_name,
              co_extension_name: firstRow.co_extension_name,
              co_date_of_birth: firstRow.co_date_of_birth,
              co_place_of_birth: firstRow.co_place_of_birth,
              co_age: firstRow.co_age,
              co_gender: firstRow.co_gender,
              co_civil_status: firstRow.co_civil_status,
              co_contact_number: firstRow.co_contact_number,
              co_relationship_primary: firstRow.co_relationship_primary,
              co_complete_address: firstRow.co_complete_address
            }
          : null,
        transactions: transactions.length > 0 ? transactions : null,
        rollovers: rollovers.length > 0 ? rollovers : null
      };
    } catch (err) {
      console.error("Error fetching time deposit data:", err);
      throw err;
    }
  },

  createRollover: async ({
    timeDepositId,
    rollover_date = new Date(),
    previous_maturity_date,
    new_maturity_date,
    interest_earned,
    rollover_amount,
    created_by
  }) => {
    try {
      await db.beginTransaction();

      // Insert rollover record
      const rolloverSql = `
        INSERT INTO time_deposit_rollovers (
          timeDepositId, rollover_date, previous_maturity_date, 
          new_maturity_date, interest_earned, rollover_amount, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const rolloverParams = [
        timeDepositId,
        rollover_date,
        previous_maturity_date,
        new_maturity_date,
        interest_earned,
        rollover_amount,
        created_by
      ];

      const [rolloverResult] = await db.execute(rolloverSql, rolloverParams);

      // Update time deposit status and amount
      const updateSql = `
        UPDATE time_deposit 
        SET 
          amount = ?,
          maturityDate = ?,
          account_status = 'ACTIVE'
        WHERE timeDepositId = ?
      `;

      await db.execute(updateSql, [rollover_amount, new_maturity_date, timeDepositId]);

      // Create transaction record for rollover
      await TimeDeposit.createTimeDepositTransaction({
        time_deposit_id: timeDepositId,
        transaction_type: "Rollover",
        amount: rollover_amount,
        authorized_by: created_by,
        user_type: "System",
        remarks: `Rolled over with interest earned: ${interest_earned}`
      });

      await db.commit();
      return rolloverResult;
    } catch (error) {
      await db.rollback();
      throw error;
    }
  }
};

module.exports = TimeDeposit;