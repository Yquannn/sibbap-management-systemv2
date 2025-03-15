const db = require('../config/db');


function generateVoucherNumber() {
  const timestamp = Date.now();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CVN-${timestamp}-${randomNum}`;


}


async function createLoanApplication(data) {
  const {
    client_voucher_number,
    memberId, // Must be valid and exist in the members table
    loan_type,
    application,
    loan_amount,
    interest,
    terms,
    balance,
    status, // expecting status e.g. "Approved", "Pending", etc.
    details,
    service_fee,
    personalInfo
  } = data;
  let conn;
  
  // Generate a voucher number if not provided.
  const voucherNumber = client_voucher_number || generateVoucherNumber();
  
  try {
    conn = await db.getConnection();

    // Check if the member exists and is not already borrowing.
    const [memberResult] = await conn.query(
      "SELECT is_borrower FROM members WHERE memberId = ?",
      [memberId]
    );
    if (!memberResult.length) {
      throw new Error("Member not found.");
    }
    // If is_borrower is 1, the member is already borrowing and cannot borrow again.
    if (Number(memberResult[0].is_borrower) === 1) {
      throw new Error("Member is already a borrower and cannot borrow again.");
    }
    
    await conn.beginTransaction();
  
    // Insert into loan_applications.
    const [result] = await conn.query(
      `INSERT INTO loan_applications 
       (client_voucher_number, memberId, loan_type, application, loan_amount, interest, terms, balance, service_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [voucherNumber, memberId, loan_type, application, loan_amount, interest, terms, balance, service_fee]
    );
    
    const loanApplicationId = result.insertId;
    console.log("Loan Application created with ID:", loanApplicationId);
  
    // Insert personal information if provided.
    if (personalInfo) {
      const personalQuery = `
        INSERT INTO loan_personal_information (
          loan_application_id,
          memberCode,
          last_name,
          first_name,
          middle_name,
          date_of_birth,
          birthplace_province,
          age,
          civil_status,
          sex,
          number_of_dependents,
          spouse_name,
          spouse_occupation_source_of_income,
          occupation_source_of_income,
          monthly_income,
          employer_address,
          employer_address2
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          memberCode = VALUES(memberCode),
          last_name = VALUES(last_name),
          first_name = VALUES(first_name),
          middle_name = VALUES(middle_name),
          date_of_birth = VALUES(date_of_birth),
          birthplace_province = VALUES(birthplace_province),
          age = VALUES(age),
          civil_status = VALUES(civil_status),
          sex = VALUES(sex),
          number_of_dependents = VALUES(number_of_dependents),
          spouse_name = VALUES(spouse_name),
          spouse_occupation_source_of_income = VALUES(spouse_occupation_source_of_income),
          occupation_source_of_income = VALUES(occupation_source_of_income),
          monthly_income = VALUES(monthly_income),
          employer_address = VALUES(employer_address),
          employer_address2 = VALUES(employer_address2)
      `;
      const personalValues = [
        loanApplicationId,
        personalInfo.memberCode,
        personalInfo.last_name,
        personalInfo.first_name,
        personalInfo.middle_name,
        personalInfo.date_of_birth,
        personalInfo.birthplace_province,
        personalInfo.age,
        personalInfo.civil_status,
        personalInfo.sex,
        personalInfo.number_of_dependents,
        personalInfo.spouse_name,
        personalInfo.spouse_occupation_source_of_income,
        personalInfo.occupation_source_of_income,
        personalInfo.monthly_income ? personalInfo.monthly_income * 12 : personalInfo.monthly_income,
        personalInfo.employer_address,
        personalInfo.employer_address2,
      ];
      await conn.query(personalQuery, personalValues);
      console.log("Personal information inserted for loan ID:", loanApplicationId);
    }
  
    // Insert into the appropriate detail table based on loan_type.
    switch (loan_type) {
      case 'Feeds Loan':
      case 'Rice Loan':
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
        console.log("Feeds/Rice details inserted for loan ID:", loanApplicationId);
        break;
  
      case 'Marketing Loan':
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
        console.log("Marketing details inserted for loan ID:", loanApplicationId);
        break;
  
      case 'BackToBack Loan':
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
        console.log("BackToBack details inserted for loan ID:", loanApplicationId);
        break;
  
      case 'Regular Loan':
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
        console.log("Regular details inserted for loan ID:", loanApplicationId);
        break;
  
      default:
        throw new Error('Invalid loan type provided.');
    }
  
    // Commit the transaction after successful queries.
    await conn.commit();
  
    return { loanApplicationId };
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error in createLoanApplication:", error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}



// async function createLoanApplication(data) {
//   const {
//     client_voucher_number,
//     memberId, // must be provided and valid (exists in members table)
//     loan_type,
//     application,
//     loan_amount,
//     interest,
//     terms,
//     balance,
//     details,
//     service_fee,
//     personalInfo 
//   } = data;
//   let conn;

//   const voucherNumber = client_voucher_number || generateVoucherNumber();

//   try {
//     conn = await db.getConnection();
//     await conn.beginTransaction();

//     // Insert into loan_applications including memberId
//     const [result] = await conn.query(
//       `INSERT INTO loan_applications (client_voucher_number, memberId, loan_type, application, loan_amount, interest, terms, balance, service_fee)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [voucherNumber, memberId, loan_type, application, loan_amount, interest, terms, balance, service_fee]
//     );
//     const loanApplicationId = result.insertId;

//     // Insert personal information if provided.
//     // Use the auto-generated loanApplicationId as foreign key.
//     if (personalInfo) {
//       const personalQuery = `
//         INSERT INTO loan_personal_information (
//           loan_application_id,
//           memberCode,
//           last_name,
//           first_name,
//           middle_name,
//           date_of_birth,
//           birthplace_province,
//           age,
//           civil_status,
//           sex,
//           number_of_dependents,
//           spouse_name,
//           spouse_occupation_source_of_income,
//           occupation_source_of_income,
//           monthly_income,
//           employer_address,
//           employer_address2
//         )
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         ON DUPLICATE KEY UPDATE
//           memberCode = VALUES(memberCode),
//           last_name = VALUES(last_name),
//           first_name = VALUES(first_name),
//           middle_name = VALUES(middle_name),
//           date_of_birth = VALUES(date_of_birth),
//           birthplace_province = VALUES(birthplace_province),
//           age = VALUES(age),
//           civil_status = VALUES(civil_status),
//           sex = VALUES(sex),
//           number_of_dependents = VALUES(number_of_dependents),
//           spouse_name = VALUES(spouse_name),
//           spouse_occupation_source_of_income = VALUES(spouse_occupation_source_of_income),
//           occupation_source_of_income = VALUES(occupation_source_of_income),
//           monthly_income = VALUES(monthly_income),
//           employer_address = VALUES(employer_address),
//           employer_address2 = VALUES(employer_address2)
//       `;
//       const personalValues = [
//         loanApplicationId,
//         personalInfo.memberCode,
//         personalInfo.last_name,
//         personalInfo.first_name,
//         personalInfo.middle_name,
//         personalInfo.date_of_birth,
//         personalInfo.birthplace_province,
//         personalInfo.age,
//         personalInfo.civil_status,
//         personalInfo.sex,
//         personalInfo.number_of_dependents,
//         personalInfo.spouse_name,
//         personalInfo.spouse_occupation_source_of_income,
//         personalInfo.occupation_source_of_income,
//         personalInfo.monthly_income ? personalInfo.monthly_income * 12 : personalInfo.monthly_income,
//         personalInfo.employer_address,
//         personalInfo.employer_address2,
//       ];
//       await conn.query(personalQuery, personalValues);
//     }

//     // Insert into the appropriate detail table based on loan_type.
//     switch (loan_type) {
//       case 'Feeds Loan':
//       case 'Rice Loan':
//         await conn.query(
//           `INSERT INTO feeds_rice_details 
//            (loan_application_id, statement_of_purpose, sacks, max_sacks, proof_of_business)
//            VALUES (?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.sacks,
//             details.max_sacks,
//             details.proof_of_business,
//           ]
//         );
//         break;

//       case 'Marketing Loan':
//         await conn.query(
//           `INSERT INTO marketing_details 
//            (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
//            VALUES (?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.comaker_name,
//             details.comaker_member_id,
//           ]
//         );
//         break;

//       case 'BackToBack Loan':
//         await conn.query(
//           `INSERT INTO backtoback_details 
//            (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.coborrower_member_id,
//             details.coborrower_relationship,
//             details.coborrower_name,
//             details.coborrower_contact,
//             details.coborrower_address,
//           ]
//         );
//         break;

//       case 'Regular Loan':
//         await conn.query(
//           `INSERT INTO regular_details 
//            (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
//            VALUES (?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.comaker_name,
//             details.comaker_member_id,
//           ]
//         );
//         break;

//       case 'Livelihood Loan':
//         await conn.query(
//           `INSERT INTO livelihood_details 
//            (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
//            VALUES (?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.comaker_name,
//             details.comaker_member_id,
//           ]
//         );
//         break;

//       case 'Educational Loan':
//         await conn.query(
//           `INSERT INTO educational_details 
//            (loan_application_id, statement_of_purpose, relative_relationship, student_name, institution, course, year_level, document)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.relative_relationship,
//             details.student_name,
//             details.institution,
//             details.course,
//             details.year_level,
//             details.document,
//           ]
//         );
//         break;

//       case 'Emergency Loan':
//         await conn.query(
//           `INSERT INTO emergency_details 
//            (loan_application_id, statement_of_purpose, emergency_other_purpose, document)
//            VALUES (?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.emergency_other_purpose,
//             details.document,
//           ]
//         );
//         break;

//       case 'QuickCash Loan':
//         await conn.query(
//           `INSERT INTO quickcash_details 
//            (loan_application_id, statement_of_purpose)
//            VALUES (?, ?)`,
//           [loanApplicationId, details.statement_of_purpose]
//         );
//         break;

//       case 'Car Loan':
//         await conn.query(
//           `INSERT INTO car_details 
//            (loan_application_id, statement_of_purpose, vehicle_type, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.vehicle_type,
//             details.comaker_name,
//             details.comaker_member_id,
//             details.coborrower_member_id,
//             details.coborrower_relationship,
//             details.coborrower_name,
//             details.coborrower_contact,
//             details.coborrower_address,
//             details.document,
//           ]
//         );
//         break;

//       case 'Housing Loan':
//         await conn.query(
//           `INSERT INTO housing_details 
//            (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.comaker_name,
//             details.comaker_member_id,
//             details.coborrower_member_id,
//             details.coborrower_relationship,
//             details.coborrower_name,
//             details.coborrower_contact,
//             details.coborrower_address,
//             details.document,
//           ]
//         );
//         break;

//       case 'Motorcycle Loan':
//         await conn.query(
//           `INSERT INTO motorcycle_details 
//            (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.comaker_name,
//             details.comaker_member_id,
//             details.coborrower_member_id,
//             details.coborrower_relationship,
//             details.coborrower_name,
//             details.coborrower_contact,
//             details.coborrower_address,
//             details.document,
//           ]
//         );
//         break;

//       case 'MemorialLot Loan':
//         await conn.query(
//           `INSERT INTO memoriallot_details 
//            (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_name)
//            VALUES (?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.coborrower_member_id,
//             details.coborrower_name,
//           ]
//         );
//         break;

//       case 'IntermentLot Loan':
//         await conn.query(
//           `INSERT INTO intermentlot_details 
//            (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_name, interment_interest)
//            VALUES (?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.coborrower_member_id,
//             details.coborrower_name,
//             details.interment_interest,
//           ]
//         );
//         break;

//       case 'Travel Loan':
//         await conn.query(
//           `INSERT INTO travel_details 
//            (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, document)
//            VALUES (?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.comaker_name,
//             details.comaker_member_id,
//             details.document,
//           ]
//         );
//         break;

//       case 'Ofw Loan':
//         await conn.query(
//           `INSERT INTO ofw_details 
//            (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_name, coborrower_relationship, coborrower_contact, coborrower_address, document)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.comaker_name,
//             details.comaker_member_id,
//             details.coborrower_member_id,
//             details.coborrower_name,
//             details.coborrower_relationship,
//             details.coborrower_contact,
//             details.coborrower_address,
//             details.document,
//           ]
//         );
//         break;

//       case 'Savings Loan':
//         await conn.query(
//           `INSERT INTO savings_details 
//            (loan_application_id, statement_of_purpose, document)
//            VALUES (?, ?, ?)`,
//           [loanApplicationId, details.statement_of_purpose, details.document]
//         );
//         break;

//       case 'Health Loan':
//         await conn.query(
//           `INSERT INTO health_details 
//            (loan_application_id, statement_of_purpose, document)
//            VALUES (?, ?, ?)`,
//           [loanApplicationId, details.statement_of_purpose, details.document]
//         );
//         break;

//       case 'Special Loan':
//         await conn.query(
//           `INSERT INTO special_details 
//            (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, document, gift_check_amount)
//            VALUES (?, ?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.comaker_name,
//             details.comaker_member_id,
//             details.document,
//             details.gift_check_amount,
//           ]
//         );
//         break;

//       case 'Reconstruction Loan':
//         await conn.query(
//           `INSERT INTO reconstruction_details 
//            (loan_application_id, statement_of_purpose, scheduled_payment, comaker1_name, comaker1_member_id, comaker2_name, comaker2_member_id, document)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             loanApplicationId,
//             details.statement_of_purpose,
//             details.scheduled_payment,
//             details.comaker1_name,
//             details.comaker1_member_id,
//             details.comaker2_name,
//             details.comaker2_member_id,
//             details.document,
//           ]
//         );
//         break;

//       default:
//         throw new Error('Invalid loan type provided.');
//     }

//     await conn.commit();
//     return { loanApplicationId };
//   } catch (error) {
//     if (conn) await conn.rollback();
//     throw error;
//   } finally {
//     if (conn) conn.release();
//   }
// }



// GET function: If personalInfo is passed in data, use the provided id (loan_application_id) as the foreign key.
async function getLoanApplicationById(id, data = {}) {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      `SELECT 
    la.*, 
    lpi.memberCode, 
    lpi.last_name, 
    lpi.first_name, 
    lpi.middle_name, 
    lpi.date_of_birth, 
    lpi.birthplace_province, 
    lpi.age, 
    lpi.civil_status, 
    lpi.sex, 
    lpi.number_of_dependents, 
    lpi.spouse_name, 
    lpi.spouse_occupation_source_of_income, 
    lpi.occupation_source_of_income, 
    lpi.monthly_income, 
    lpi.employer_address, 
    lpi.employer_address2,
    m.id_picture,
    m.share_capital,
    rs.amount
FROM 
    loan_applications la
LEFT JOIN 
    loan_personal_information lpi 
    ON la.loan_application_id = lpi.loan_application_id
LEFT JOIN 
    members m 
    ON la.memberId = m.memberId
LEFT JOIN 
    regular_savings rs 
    ON m.memberId = rs.memberId
WHERE 
    la.loan_application_id = ?

`,
      [id]
    );
    if (rows.length === 0) return null;
    const application = rows[0];

    let detailQuery = null;
    switch (application.loan_type) {
      case 'Feeds Loan':
      case 'Rice Loan':
        detailQuery = `SELECT * FROM feeds_rice_details WHERE loan_application_id = ?`;
        break;
      case 'Marketing Loan':
        detailQuery = `SELECT * FROM marketing_details WHERE loan_application_id = ?`;
        break;
      case 'BackToBack Loan':
        detailQuery = `SELECT * FROM backtoback_details WHERE loan_application_id = ?`;
        break;
      case 'Regular Loan':
        detailQuery = `SELECT * FROM regular_details WHERE loan_application_id = ?`;
        break;
      case 'Livelihood Loan':
        detailQuery = `SELECT * FROM livelihood_details WHERE loan_application_id = ?`;
        break;
      case 'Educational Loan':
        detailQuery = `SELECT * FROM educational_details WHERE loan_application_id = ?`;
        break;
      case 'Emergency Loan':
        detailQuery = `SELECT * FROM emergency_details WHERE loan_application_id = ?`;
        break;
      case 'QuickCash Loan':
        detailQuery = `SELECT * FROM quickcash_details WHERE loan_application_id = ?`;
        break;
      case 'Car Loan':
        detailQuery = `SELECT * FROM car_details WHERE loan_application_id = ?`;
        break;
      case 'Housing Loan':
        detailQuery = `SELECT * FROM housing_details WHERE loan_application_id = ?`;
        break;
      case 'Motorcycle Loan':
        detailQuery = `SELECT * FROM motorcycle_details WHERE loan_application_id = ?`;
        break;
      case 'MemorialLot Loan':
        detailQuery = `SELECT * FROM memoriallot_details WHERE loan_application_id = ?`;
        break;
      case 'IntermentLot Loan':
        detailQuery = `SELECT * FROM intermentlot_details WHERE loan_application_id = ?`;
        break;
      case 'Travel Loan':
        detailQuery = `SELECT * FROM travel_details WHERE loan_application_id = ?`;
        break;
      case 'Ofw Loan':
        detailQuery = `SELECT * FROM ofw_details WHERE loan_application_id = ?`;
        break;
      case 'Savings Loan':
        detailQuery = `SELECT * FROM savings_details WHERE loan_application_id = ?`;
        break;
      case 'Health Loan':
        detailQuery = `SELECT * FROM health_details WHERE loan_application_id = ?`;
        break;
      case 'Special Loan':
        detailQuery = `SELECT * FROM special_details WHERE loan_application_id = ?`;
        break;
      case 'Reconstruction Loan':
        detailQuery = `SELECT * FROM reconstruction_details WHERE loan_application_id = ?`;
        break;
      default:
        detailQuery = null;
    }
    let detailsObj = {};
    if (detailQuery) {
      const [detailRows] = await conn.query(detailQuery, [id]);
      if (detailRows.length > 0) {
        detailsObj = detailRows[0];
      }
    }
    application.details = detailsObj;
    return application;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}




async function createInstallments(loanApplicationId, terms, loan_amount, service_fee) {
  let conn;
  try {
    conn = await db.getConnection();

    // Select the current status of the loan application.
    const [loanRows] = await conn.query(
      `SELECT status FROM loan_applications WHERE loan_application_id = ?`,
      [loanApplicationId]
    );
    if (loanRows.length === 0) {
      console.error(`Loan application with ID ${loanApplicationId} not found.`);
      return;
    }
    const loanStatus = loanRows[0].status;
    console.log(`Loan application status for ID ${loanApplicationId}: ${loanStatus}`);
    
    // Proceed only if the status is approved.
    if (String(loanStatus).toLowerCase() !== "approved") {
      console.log(`Loan application ${loanApplicationId} is not approved. Installments will not be created.`);
      return;
    }

    // Calculate installment details.
    const numTerms = Number(terms);
    const principalAmount = Number(loan_amount);
    const fee = Number(service_fee);
    const totalAmount = principalAmount + fee;
    const installmentAmount = totalAmount / numTerms;
  
    // Create installments using the current date as the base date for due dates.
    for (let i = 0; i < numTerms; i++) {
      let dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1); // Increment due date by 1 month per installment
      await conn.query(
        `INSERT INTO installments 
         (loan_application_id, installment_number, amount, due_date, status)
         VALUES (?, ?, ?, ?, 'Unpaid')`,
        [loanApplicationId, i + 1, installmentAmount.toFixed(2), dueDate.toISOString().split('T')[0]]
      );
      console.log(`Installment ${i + 1} created with due date ${dueDate.toISOString().split('T')[0]}`);
    }
    console.log(`Created ${numTerms} installment(s) for loan application ID ${loanApplicationId}`);
  } catch (error) {
    console.error("Error creating installments for loan application ID", loanApplicationId, ":", error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}
  
async function updateLoanStatus(id, newStatus) {
  let conn;
  try {
    conn = await db.getConnection();
    console.log("Updating loan:", { id, newStatus });
    const [result] = await conn.query(
      `UPDATE loan_applications SET status = ? WHERE loan_application_id = ?`,
      [newStatus, id]
    );
    console.log("Update result:", result);

    // If the new status is "approved", fetch additional fields to create installments.
    if (String(newStatus).toLowerCase() === "approved") {
      const [rows] = await conn.query(
        `SELECT terms, loan_amount, service_fee FROM loan_applications WHERE loan_application_id = ?`,
        [id]
      );
      if (rows.length > 0) {
        const { terms, loan_amount, service_fee } = rows[0];
        console.log("Creating installments with:", { terms, loan_amount, service_fee });
        await createInstallments(id, terms, loan_amount, service_fee);
      } else {
        console.log("Loan application not found for installment creation.");
      }
    } else {
      console.log("Loan is not approved. Skipping installment creation.");
    }
  
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating loan status for ID", id, ":", error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}



async function getAllLoanApplicant() {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      `SELECT loan_application_id FROM loan_applications`
    );
    const applications = await Promise.all(
      rows.map((row) => getLoanApplicationById(row.loan_application_id))
    );
    return applications;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}



async function getAllLoanApprove() {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      `SELECT loan_application_id FROM loan_applications WHERE status = "Waiting for Approval"`
    );
    const applications = await Promise.all(
      rows.map((row) => getLoanApplicationById(row.loan_application_id))
    );
    return applications;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
  
}

async function getAllBorrowers() {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(`
      SELECT la.*, m.memberCode, m.first_name, m.last_name, m.middle_name
      FROM loan_applications la
      JOIN members m ON la.memberId = m.memberId
      WHERE la.status = "Approved" AND la.loan_status = "Active"
    `);
    return rows;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function getExistingLoan(memberId) {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      `SELECT la.*, m.first_name, m.last_name, m.middle_name
       FROM loan_applications la
       JOIN members m ON la.memberId = m.memberId
       WHERE la.status = "Approved" AND m.memberId = ?`,
      [memberId]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function getMemberLoansById(memberId) {  
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      `SELECT 
          la.*, 
          frd.*, 
          m.first_name, 
          m.last_name, 
          m.middle_name
       FROM loan_applications la
       JOIN members m ON la.memberId = m.memberId
       LEFT JOIN feeds_rice_details frd ON la.loan_application_id = frd.loan_application_id
       WHERE m.memberId = ?`,
      [memberId]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}


async function getLoanByInformationId(memberId) {  
  let conn;
  try {
    conn = await db.getConnection();
    
    // Fetch approved and active loan applications for the given member.
    const [loanApplications] = await conn.query(
      `SELECT * FROM loan_applications 
       WHERE memberId = ? 
         AND status = 'Approved'
         AND loan_status = 'Active'`,
      [memberId]
    );
    console.log("Loan Applications:", loanApplications);

    // Use the filtered loan_application_ids in subqueries.
    const loanAppIdsQuery = `
      SELECT loan_application_id FROM loan_applications 
      WHERE memberId = ? 
        AND status = 'Approved'
        AND loan_status = 'Active'
    `;
    
    // Fetch feeds_rice_details for the approved and active loan applications.
    const [feedsRiceDetails] = await conn.query(
      `SELECT * FROM feeds_rice_details 
       WHERE loan_application_id IN (${loanAppIdsQuery})`,
      [memberId]
    );
    console.log("Feeds Rice Details:", feedsRiceDetails);

    // Fetch loan_personal_information for the approved and active loan applications.
    const [loanPersonalInformation] = await conn.query(
      `SELECT * FROM loan_personal_information 
       WHERE loan_application_id IN (${loanAppIdsQuery})`,
      [memberId]
    );
    console.log("Loan Personal Information:", loanPersonalInformation);
    
    // Fetch installments for the approved and active loan applications.
    const [installments] = await conn.query(
      `SELECT * FROM installments 
       WHERE loan_application_id IN (${loanAppIdsQuery})`,
      [memberId]
    );
    console.log("Installments:", installments);

    // Fetch repayments for installments of the approved and active loan applications.
    const [repayments] = await conn.query(
      `SELECT * FROM repayments
       WHERE installment_id IN (
         SELECT installment_id FROM installments 
         WHERE loan_application_id IN (${loanAppIdsQuery})
       )`,
       [memberId]
    );
    console.log("Repayments:", repayments);

    return {
      loanApplications,
      feedsRiceDetails,
      loanPersonalInformation,
      installments,
      repayments
    };
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}


async function getLoanByInformationIdForAdmin(memberId) {
  let conn;
  try {
    conn = await db.getConnection();

    // 1. Get all loan applications for the given member
    const [loanApplications] = await conn.query(
      `SELECT * FROM loan_applications 
       WHERE memberId = ?`,
      [memberId]
    );
    console.log("Loan Applications:", loanApplications);

    // Extract loan_application_ids from the result
    const loanApplicationIds = loanApplications.map(row => row.loan_application_id);

    // If no loan applications exist, return empty data
    if (loanApplicationIds.length === 0) {
      return {
        loanApplications: [],
        feedsRiceDetails: [],
        loanPersonalInformation: [],
        installments: [],
        repayments: []
      };
    }

    // 2. Get feeds_rice_details for all loan applications
    const [feedsRiceDetails] = await conn.query(
      `SELECT * FROM feeds_rice_details 
       WHERE loan_application_id IN (?)`,
      [loanApplicationIds]
    );
    console.log("Feeds Rice Details:", feedsRiceDetails);

    // 3. Get loan personal information for all loan applications
    const [loanPersonalInformation] = await conn.query(
      `SELECT * FROM loan_personal_information 
       WHERE loan_application_id IN (?)`,
      [loanApplicationIds]
    );
    console.log("Loan Personal Information:", loanPersonalInformation);

    // 4. Get installments for all loan applications
    const [installments] = await conn.query(
      `SELECT * FROM installments 
       WHERE loan_application_id IN (?)`,
      [loanApplicationIds]
    );
    console.log("Installments:", installments);

    // Extract installment IDs for repayments
    const installmentIds = installments.map(row => row.installment_id);

    // 5. Get repayments for all installments
    let repayments = [];
    if (installmentIds.length > 0) {
      const [repaymentsResult] = await conn.query(
        `SELECT * FROM repayments
         WHERE installment_id IN (?)`,
        [installmentIds]
      );
      repayments = repaymentsResult;
    }
    console.log("Repayments:", repayments);

    return {
      loanApplications,
      feedsRiceDetails,
      loanPersonalInformation,
      installments,
      repayments
    };
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}






async function updateLoanRemarks(id, newStatus = "Waiting for Approval", remarks) {
  let conn;
  try {
    conn = await db.getConnection();
    console.log("Updating loan:", { id, newStatus, remarks });
    const [result] = await conn.query(
      `UPDATE loan_applications SET status = ?, remarks = ? WHERE loan_application_id = ?`,
      [newStatus, remarks, id]
    );
    console.log("Update result:", result);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}


// async function updateLoanStatus(id, newStatus) {
//   let conn;
//   try {
//     conn = await db.getConnection();
//     console.log("Updating loan:", { id, newStatus });
//     const [result] = await conn.query(
//       `UPDATE loan_applications SET status = ? WHERE loan_application_id = ?`,
//       [newStatus, id]
//     );
//     console.log("Update result:", result);
//     return result.affectedRows > 0;
//   } catch (error) {
//     throw error;
//   } finally {
//     if (conn) conn.release();
//   }
// }


// async function updateFeedback(id, remarks) {
//   let conn;
//   try {
//     conn = await db.getConnection();
//     const [result] = await conn.query(
//       `UPDATE loan_applications SET remarks = ? WHERE loan_application_id = ?`,
//       [remarks, id]
//     );
//     return result.affectedRows > 0;
//   } catch (error) {
//     throw error;
//   } finally {
//     if (conn) conn.release();
//   }
// }





// ✅ Ensure all functions are correctly exported
module.exports = {
  createLoanApplication, 
  getLoanApplicationById,
  getAllLoanApplicant,
  updateLoanRemarks,  // updateFeedback,
  getAllLoanApprove,
  getAllBorrowers,
  getMemberLoansById,
  updateLoanStatus,
  getExistingLoan,
  getLoanByInformationId,
  getLoanByInformationIdForAdmin

  
};
