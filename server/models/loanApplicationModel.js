const db = require('../config/db');



async function createLoanApplication(data) {
  const { memberId, loan_type, loan_amount, terms, details } = data;
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Insert into common loan_applications table
    const [result] = await conn.query(
      `INSERT INTO loan_applications (memberId, loan_type, loan_amount, terms)
       VALUES (?, ?, ?, ?)`,
      [memberId, loan_type, loan_amount, terms]
    );
    const loanApplicationId = result.insertId;

    // Insert into the appropriate detail table based on loan_type
    switch (loan_type) {
      case 'feeds':
      case 'rice':
        await conn.query(
          `INSERT INTO feeds_rice_details 
           (loan_application_id, statement_of_purpose, sacks, max_sacks, proof_of_business)
           VALUES (?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.sacks,
            details.max_sacks,
            details.proof_of_business,
          ]
        );
        break;

      case 'marketing':
        await conn.query(
          `INSERT INTO marketing_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
          ]
        );
        break;

      case 'backToBack':
        await conn.query(
          `INSERT INTO backtoback_details 
           (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.coborrower_member_id,
            details.coborrower_relationship,
            details.coborrower_name,
            details.coborrower_contact,
            details.coborrower_address,
          ]
        );
        break;

      case 'regular':
        await conn.query(
          `INSERT INTO regular_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
          ]
        );
        break;

      case 'livelihood':
        await conn.query(
          `INSERT INTO livelihood_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
          ]
        );
        break;

      case 'educational':
        await conn.query(
          `INSERT INTO educational_details 
           (loan_application_id, statement_of_purpose, relative_relationship, student_name, institution, course, year_level, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.relative_relationship,
            details.student_name,
            details.institution,
            details.course,
            details.year_level,
            details.document,
          ]
        );
        break;

      case 'emergency':
        await conn.query(
          `INSERT INTO emergency_details 
           (loan_application_id, statement_of_purpose, emergency_other_purpose, document)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.emergency_other_purpose,
            details.document,
          ]
        );
        break;

      case 'quickCash':
        await conn.query(
          `INSERT INTO quickcash_details 
           (loan_application_id, statement_of_purpose)
           VALUES (?, ?)`,
          [loanApplicationId, details.statement_of_purpose]
        );
        break;

      case 'car':
        await conn.query(
          `INSERT INTO car_details 
           (loan_application_id, statement_of_purpose, vehicle_type, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.vehicle_type,
            details.comaker_name,
            details.comaker_member_id,
            details.coborrower_member_id,
            details.coborrower_relationship,
            details.coborrower_name,
            details.coborrower_contact,
            details.coborrower_address,
            details.document,
          ]
        );
        break;

      case 'housing':
        await conn.query(
          `INSERT INTO housing_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.coborrower_member_id,
            details.coborrower_relationship,
            details.coborrower_name,
            details.coborrower_contact,
            details.coborrower_address,
            details.document,
          ]
        );
        break;

      case 'motorcycle':
        await conn.query(
          `INSERT INTO motorcycle_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.coborrower_member_id,
            details.coborrower_relationship,
            details.coborrower_name,
            details.coborrower_contact,
            details.coborrower_address,
            details.document,
          ]
        );
        break;

      case 'memorialLot':
        await conn.query(
          `INSERT INTO memoriallot_details 
           (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_name)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.coborrower_member_id,
            details.coborrower_name,
          ]
        );
        break;

      case 'intermentLot':
        await conn.query(
          `INSERT INTO intermentlot_details 
           (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_name, interment_interest)
           VALUES (?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.coborrower_member_id,
            details.coborrower_name,
            details.interment_interest,
          ]
        );
        break;

      case 'travel':
        await conn.query(
          `INSERT INTO travel_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, document)
           VALUES (?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.document,
          ]
        );
        break;

      case 'ofw':
        await conn.query(
          `INSERT INTO ofw_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_name, coborrower_relationship, coborrower_contact, coborrower_address, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.coborrower_member_id,
            details.coborrower_name,
            details.coborrower_relationship,
            details.coborrower_contact,
            details.coborrower_address,
            details.document,
          ]
        );
        break;

      case 'savings':
        await conn.query(
          `INSERT INTO savings_details 
           (loan_application_id, statement_of_purpose, document)
           VALUES (?, ?, ?)`,
          [loanApplicationId, details.statement_of_purpose, details.document]
        );
        break;

      case 'health':
        await conn.query(
          `INSERT INTO health_details 
           (loan_application_id, statement_of_purpose, document)
           VALUES (?, ?, ?)`,
          [loanApplicationId, details.statement_of_purpose, details.document]
        );
        break;

      case 'special':
        await conn.query(
          `INSERT INTO special_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, document, gift_check_amount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.document,
            details.gift_check_amount,
          ]
        );
        break;

      case 'reconstruction':
        await conn.query(
          `INSERT INTO reconstruction_details 
           (loan_application_id, statement_of_purpose, scheduled_payment, comaker1_name, comaker1_member_id, comaker2_name, comaker2_member_id, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.scheduled_payment,
            details.comaker1_name,
            details.comaker1_member_id,
            details.comaker2_name,
            details.comaker2_member_id,
            details.document,
          ]
        );
        break;

      default:
        throw new Error('Invalid loan type provided.');
    }

    await conn.commit();
    return { loanApplicationId };
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    throw error;
  } finally {
    if (conn) conn.release();
  }
}


async function getLoanApplicationById(id) {
    let conn;
    try {
      conn = await db.getConnection();
  
      // Get the common loan application record
      const [rows] = await conn.query(
        `SELECT * FROM loan_applications WHERE loan_application_id = ?`,
        [id]
      );
      if (rows.length === 0) return null;
      const application = rows[0];
  
      // Determine which details table to query based on the loan_type
      let detailQuery = null;
      switch (application.loan_type) {
        case 'feeds':
        case 'rice':
          detailQuery = `SELECT * FROM feeds_rice_details WHERE loan_application_id = ?`;
          break;
        case 'marketing':
          detailQuery = `SELECT * FROM marketing_details WHERE loan_application_id = ?`;
          break;
        case 'backToBack':
          detailQuery = `SELECT * FROM backtoback_details WHERE loan_application_id = ?`;
          break;
        case 'regular':
          detailQuery = `SELECT * FROM regular_details WHERE loan_application_id = ?`;
          break;
        case 'livelihood':
          detailQuery = `SELECT * FROM livelihood_details WHERE loan_application_id = ?`;
          break;
        case 'educational':
          detailQuery = `SELECT * FROM educational_details WHERE loan_application_id = ?`;
          break;
        case 'emergency':
          detailQuery = `SELECT * FROM emergency_details WHERE loan_application_id = ?`;
          break;
        case 'quickCash':
          detailQuery = `SELECT * FROM quickcash_details WHERE loan_application_id = ?`;
          break;
        case 'car':
          detailQuery = `SELECT * FROM car_details WHERE loan_application_id = ?`;
          break;
        case 'housing':
          detailQuery = `SELECT * FROM housing_details WHERE loan_application_id = ?`;
          break;
        case 'motorcycle':
          detailQuery = `SELECT * FROM motorcycle_details WHERE loan_application_id = ?`;
          break;
        case 'memorialLot':
          detailQuery = `SELECT * FROM memoriallot_details WHERE loan_application_id = ?`;
          break;
        case 'intermentLot':
          detailQuery = `SELECT * FROM intermentlot_details WHERE loan_application_id = ?`;
          break;
        case 'travel':
          detailQuery = `SELECT * FROM travel_details WHERE loan_application_id = ?`;
          break;
        case 'ofw':
          detailQuery = `SELECT * FROM ofw_details WHERE loan_application_id = ?`;
          break;
        case 'savings':
          detailQuery = `SELECT * FROM savings_details WHERE loan_application_id = ?`;
          break;
        case 'health':
          detailQuery = `SELECT * FROM health_details WHERE loan_application_id = ?`;
          break;
        case 'special':
          detailQuery = `SELECT * FROM special_details WHERE loan_application_id = ?`;
          break;
        case 'reconstruction':
          detailQuery = `SELECT * FROM reconstruction_details WHERE loan_application_id = ?`;
          break;
        default:
          detailQuery = null;
      }
      let details = {};
      if (detailQuery) {
        const [detailRows] = await conn.query(detailQuery, [id]);
        if (detailRows.length > 0) {
          details = detailRows[0];
        }
      }
      // Attach the details to the common record
      application.details = details;
      return application;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
  
  // Optionally, fetch all applications with their details
//   async function getAllLoanApplications() {
//     let conn;
//     try {
//       conn = await db.getConnection();
//       const [rows] = await conn.query(`SELECT loan_application_id FROM loan_applications`);
//       const applications = [];
//       // For each application, fetch the complete data including details
//       for (const row of rows) {
//         const app = await getLoanApplicationById(row.loanApplicationId);
//         if (app) applications.push(app);
//       }
//       return applications;
//     } catch (error) {
//       throw error;
//     } finally {
//       if (conn) conn.release();
//     }
//   }

module.exports = {
    createLoanApplication,
    getLoanApplicationById,
    // getAllLoanApplications,
};
