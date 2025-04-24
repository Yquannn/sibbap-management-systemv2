// controllers/reportController.js
const db = require('../config/db');

const reportController = {
  // Members Report
  getMembersReport: async (req, res) => {
    const { type, startDate, endDate } = req.query;
    
    try {
      let query;
      
      if (type === 'summary') {
        query = `
          SELECT 
            COUNT(*) as total_members,
            SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_members,
            SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive_members,
            SUM(CASE WHEN is_borrower = 1 THEN 1 ELSE 0 END) as borrowers,
            SUM(share_capital) as total_share_capital,
            AVG(age) as average_age
          FROM members
          WHERE registration_date BETWEEN ? AND ?
        `;
      } else { // detailed
        query = `
          SELECT 
            memberId, 
            memberCode, 
            CONCAT(last_name, ', ', first_name, ' ', middle_name) as member_name,
            registration_date,
            registration_type,
            member_type,
            share_capital,
            status,
            contact_number,
            CONCAT(house_no_street, ', ', barangay, ', ', city) as address
          FROM members
          WHERE registration_date BETWEEN ? AND ?
          ORDER BY last_name, first_name
        `;
      }
      
      const [results] = await db.query(query, [startDate || '2000-01-01', endDate || new Date()]);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error generating members report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
  },

  // Loan Report
  getLoanReport: async (req, res) => {
    const { type, startDate, endDate, status } = req.query;
    
    try {
      let query;
      let params = [startDate || '2000-01-01', endDate || new Date()];
      
      if (status) {
        params.push(status);
      }
      
      if (type === 'summary') {
        query = `
          SELECT 
            loan_type,
            COUNT(*) as total_loans,
            SUM(loan_amount) as total_amount,
            SUM(balance) as total_outstanding,
            SUM(loan_amount - balance) as total_repaid,
            AVG(interest) as average_interest
          FROM loan_applications
          WHERE created_at BETWEEN ? AND ?
          ${status ? 'AND status = ?' : ''}
          GROUP BY loan_type
        `;
      } else { // detailed
        query = `
          SELECT 
            l.loan_application_id,
            l.client_voucher_number,
            m.memberCode,
            CONCAT(m.last_name, ', ', m.first_name) as borrower_name,
            l.loan_type,
            l.loan_amount,
            l.interest,
            l.terms,
            l.balance,
            l.status,
            l.disbursed_date,
            l.approval_date
          FROM loan_applications l
          JOIN members m ON l.memberId = m.memberId
          WHERE l.created_at BETWEEN ? AND ?
          ${status ? 'AND l.status = ?' : ''}
          ORDER BY l.created_at DESC
        `;
      }
      
      const [results] = await db.query(query, params);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error generating loan report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
  },

  // Regular Savings Report
  getRegularSavingsReport: async (req, res) => {
    const { type } = req.query;
    
    try {
      let query;
      
      if (type === 'summary') {
        query = `
          SELECT 
            COUNT(DISTINCT rs.memberId) as total_savers,
            SUM(rs.amount) as total_savings,
            SUM(rs.earnings) as total_earnings,
            AVG(rs.amount) as average_savings_per_member
          FROM regular_savings rs
        `;
      } else { // detailed
        query = `
          SELECT 
            rs.savingsId,
            rs.account_number,
            m.memberCode,
            CONCAT(m.last_name, ', ', m.first_name) as member_name,
            rs.amount,
            rs.earnings,
            rs.remarks,
            rs.last_updated
          FROM regular_savings rs
          JOIN members m ON rs.memberId = m.memberId
          ORDER BY rs.amount DESC
        `;
      }
      
      const [results] = await db.query(query);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error generating regular savings report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
  },

  // Share Capital Report
  getShareCapitalReport: async (req, res) => {
    const { type, startDate, endDate } = req.query;
    
    try {
      let query;
      let params = [startDate || '2000-01-01', endDate || new Date()];
      
      if (type === 'summary') {
        query = `
          SELECT 
            COUNT(DISTINCT sc.memberId) as total_shareholders,
            SUM(sc.total_amount) as total_share_capital,
            AVG(sc.total_amount) as average_share_per_member,
            (SELECT COUNT(*) FROM share_capital_transactions 
             WHERE transaction_date BETWEEN ? AND ? 
             AND transaction_type = 'deposit') as deposits_count,
            (SELECT SUM(amount) FROM share_capital_transactions 
             WHERE transaction_date BETWEEN ? AND ? 
             AND transaction_type = 'deposit') as deposits_total,
            (SELECT COUNT(*) FROM share_capital_transactions 
             WHERE transaction_date BETWEEN ? AND ? 
             AND transaction_type = 'withdraw') as withdrawals_count,
            (SELECT SUM(amount) FROM share_capital_transactions 
             WHERE transaction_date BETWEEN ? AND ? 
             AND transaction_type = 'withdraw') as withdrawals_total
          FROM share_capital sc
        `;
        params = [...params, ...params, ...params, ...params];
      } else { // detailed
        query = `
          SELECT 
            sc.id,
            sc.memberCode,
            m.last_name,
            m.first_name,
            sc.total_amount,
            sc.created_at,
            sc.updated_at,
            (SELECT COUNT(*) FROM share_capital_transactions 
             WHERE memberCode = sc.memberCode 
             AND transaction_date BETWEEN ? AND ?) as transaction_count
          FROM share_capital sc
          JOIN members m ON sc.memberId = m.memberId
          ORDER BY sc.total_amount DESC
        `;
      }
      
      const [results] = await db.query(query, params);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error generating share capital report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
  },

  // Time Deposit Report
  getTimeDepositReport: async (req, res) => {
    const { type, status } = req.query;
    
    try {
      let query;
      let params = [];
      
      if (status) {
        params.push(status);
      }
      
      if (type === 'summary') {
        query = `
          SELECT 
            account_type,
            COUNT(*) as total_accounts,
            SUM(amount) as total_deposits,
            SUM(interest) as total_interest,
            AVG(interest_rate) as average_interest_rate
          FROM time_deposit
          ${status ? 'WHERE account_status = ?' : ''}
          GROUP BY account_type
        `;
      } else { // detailed
        query = `
          SELECT 
            td.timeDepositId,
            td.account_number,
            m.memberCode,
            CONCAT(m.last_name, ', ', m.first_name) as member_name,
            td.amount,
            td.fixedTerm,
            td.interest_rate,
            td.interest,
            td.payout,
            td.opening_date,
            td.maturityDate,
            td.account_status
          FROM time_deposit td
          JOIN members m ON td.memberId = m.memberId
          ${status ? 'WHERE td.account_status = ?' : ''}
          ORDER BY td.maturityDate
        `;
      }
      
      const [results] = await db.query(query, params);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error generating time deposit report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
  },
  
  // Kalinga Fund Report
  getKalingaReport: async (req, res) => {
    const { type, startDate, endDate } = req.query;
    
    try {
      let query;
      let params = [startDate || '2000-01-01', endDate || new Date()];
      
      if (type === 'summary') {
        query = `
          SELECT 
            COUNT(DISTINCT kc.memberId) as total_contributors,
            SUM(kc.amount) as total_contributions,
            (SELECT contribution_amount FROM kalinga_fund_settings WHERE is_active = 1 LIMIT 1) as current_contribution_rate,
            (SELECT death_benefit_amount FROM kalinga_fund_settings WHERE is_active = 1 LIMIT 1) as death_benefit,
            (SELECT hospitalization_benefit_amount FROM kalinga_fund_settings WHERE is_active = 1 LIMIT 1) as hospital_benefit
          FROM kalinga_contributions kc
          WHERE kc.payment_date BETWEEN ? AND ?
        `;
      } else { // detailed
        query = `
          SELECT 
            kc.contribution_id,
            kc.account_number,
            m.memberCode,
            CONCAT(m.last_name, ', ', m.first_name) as member_name,
            kc.payment_date,
            kc.amount,
            kc.payment_method,
            kc.receipt_number,
            kc.remarks
          FROM kalinga_contributions kc
          JOIN members m ON kc.memberId = m.memberId
          WHERE kc.payment_date BETWEEN ? AND ?
          ORDER BY kc.payment_date DESC
        `;
      }
      
      const [results] = await db.query(query, params);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error generating kalinga fund report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
  }
};

module.exports = reportController;