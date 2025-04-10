const db = require('../config/db');
const memberModel= require('../models/memberModel')

const { queryDatabase, generateUniqueMemberId, formatDate } = require('../utils/databaseHelper');
const { updateMemberFinancials } = require('../models/memberModel');
const { isApplicationComplete } = require('../utils/valiidateApplication');


exports.getMembers = async (req, res) => {
  try {
    const memberName = req.query.search ? req.query.search.trim().toLowerCase() : null;

    let query = `
      SELECT 
         mi.*, 
      ma.email, 
      ma.password, 
      ma.accountStatus, 
      b.beneficiaryName, 
      b.relationship, 
      b.beneficiaryContactNumber, 
      c.referenceName, 
      c.position, 
      c.referenceContactNumber,
      s.amount AS savingsAmount
    FROM members mi
    LEFT JOIN member_account ma ON mi.memberId = ma.memberId
    LEFT JOIN beneficiaries b ON mi.memberId = b.memberId
    LEFT JOIN character_references c ON mi.memberId = c.memberId
    LEFT JOIN regular_savings s ON mi.memberId = s.memberId
    
    WHERE mi.status = 'Active'
    `;

    const queryParams = [];

    if (memberName) {
      query += ' WHERE LOWER(mi.lastName) = ?';
      queryParams.push(memberName);
    }

    // Execute the safe query
    const members = await queryDatabase(query, queryParams);



    res.json(members.length > 0 ? members : { message: 'No members found' });
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



//VULNERATBLE TO SQL INJECTION

// exports.getMembers = async (req, res) => {
//   const memberName = req.query.name;

//   // Removed the extra comma after savingsAmount
//   let query = `
//     SELECT 
//       mi.*, 
//       ma.email, 
//       ma.password, 
//       ma.accountStatus, 
//       b.beneficiaryName, 
//       b.relationship, 
//       b.beneficiaryContactNumber, 
//       c.referenceName, 
//       c.position, 
//       c.referenceContactNumber,
//       s.amount AS savingsAmount
//     FROM members mi
//     LEFT JOIN member_account ma ON mi.memberId = ma.memberId
//     LEFT JOIN beneficiaries b ON mi.memberId = b.memberId
//     LEFT JOIN character_references c ON mi.memberId = c.memberId
//     LEFT JOIN regular_savings s ON mi.memberId = s.memberId
//   `;

//   const queryParams = [];

//   // Append filtering by member name if provided
//   if (memberName) {
//     query += ' WHERE LOWER(mi.lastName) = ?';
//     queryParams.push(memberName.toLowerCase());
//   }

//   try {
//     const members = await queryDatabase(query, queryParams);

//     if (members.length > 0) {
//       // Use a Map to merge duplicate member entries (due to JOINs)
//       const memberMap = new Map();

//       members.forEach(member => {
//         // If the member is not in the map, add it
//         if (!memberMap.has(member.memberId)) {
//           memberMap.set(member.memberId, {
//             ...member,
//             beneficiaries: [],
//             references: []
//           });
//         }

//         // Append beneficiary data if available
//         if (member.beneficiaryName) {
//           memberMap.get(member.memberId).beneficiaries.push({
//             beneficiaryName: member.beneficiaryName,
//             relationship: member.relationship,
//             beneficiaryContactNumber: member.beneficiaryContactNumber
//           });
//         }

//         // Append character reference data if available
//         if (member.referenceName) {
//           memberMap.get(member.memberId).references.push({
//             referenceName: member.referenceName,
//             position: member.position,
//             referenceContactNumber: member.referenceContactNumber
//           });
//         }
//       });

//       // Convert the map back to an array and return it as JSON
//       res.json(Array.from(memberMap.values()));
//     } else {
//       res.status(404).json({ message: 'No members found' });
//     }
//   } catch (error) {
//     console.error('Error fetching data from MySQL:', error);
//     res.status(500).json({ message: 'Error fetching data from MySQL' });
//   }
// };



exports.fetchedMemberById = async (req, res) => {
    const id = req.params.id;
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({ message: 'Invalid member ID' });
    }
  
    try {
      // Fetch the main member data (for active members) using the provided id.
      const memberQuery = `
        SELECT mi.*, ma.email, ma.password, ma.accountStatus, s.amount AS savingsAmount
        FROM members mi
        LEFT JOIN member_account ma ON mi.memberId = ma.memberId
        LEFT JOIN regular_savings s ON mi.memberId = s.memberId
        WHERE mi.status = 'Active' AND mi.memberId = ?
      `;
      const members = await queryDatabase(memberQuery, [id]);
  
      if (!members.length) {
        return res.status(404).json({ message: 'Member not found' });
      }
      const member = members[0];
  
      // Fetch purchase history for the member.
      const purchaseQuery = `SELECT * FROM purchase_history WHERE memberId = ?`;
      const purchaseHistory = await queryDatabase(purchaseQuery, [id]);
  
      // Fetch loan history for the member (assuming the table is "loan_applications").
      const loanQuery = `SELECT * FROM loan_applications WHERE memberId = ? AND loan_status = 'Paid Off'`;
      const loanHistory = await queryDatabase(loanQuery, [id]);

      // Fetch beneficiaries for the member.
      const beneficiaryQuery = `SELECT * FROM beneficiaries WHERE memberId = ?`;
      const beneficiaries = await queryDatabase(beneficiaryQuery, [id]);
  
      // Combine nested data into a single object.
      const memberWithNested = {
        ...member,
        purchase_history: purchaseHistory,
        loan_history: loanHistory,
        beneficiaries: beneficiaries
      };
  
      res.json(memberWithNested);
    } catch (error) {
      console.error("Error fetching data from MySQL:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  


exports.getMemberById = async (req, res) => {
  const id = req.params.id;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ message: 'Invalid member ID' });
  }

  // Assuming you want to join on memberId being the common key between the tables
  const query = `
    SELECT m.*, ma.email, ma.password, ma.accountStatus
    FROM members m
    LEFT JOIN member_account ma ON m.memberId = ma.memberId  
    WHERE m.memberId = ?`;
    

  try {
    const results = await queryDatabase(query, [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Member not found' });
    }
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    res.status(500).json({ message: 'Error fetching data from MySQL' });
  }
};




exports.memberApplication = async (req, res) => {
  const {
    registration_type,
    registration_date,
    annual_income,
    number_of_dependents,
    last_name,
    first_name,
    middle_name,
    maiden_name,
    extension_name,
    religion,
    tin_number,
    date_of_birth,
    birthplace_province,
    age,
    sex,
    civil_status,
    highest_educational_attainment,
    occupation_source_of_income,
    spouse_name,
    spouse_occupation_source_of_income,
    primary_beneficiary_name,
    primary_beneficiary_relationship,
    primary_beneficiary_contact,
    secondary_beneficiary_name,
    secondary_beneficiary_relationship,
    secondary_beneficiary_contact,
    contact_number,
    house_no_street,
    barangay,
    city,
    reference_name,
    position,
    reference_contact,
    email,
    password,
    savings
  } = req.body;

  // Helper function to convert numeric fields; returns null if empty
  const toNumberOrNull = (val) =>
    val !== undefined && val !== "" && !isNaN(val) ? Number(val) : null;

  const annual_incomeNum = toNumberOrNull(annual_income);
  const number_of_dependentsNum = toNumberOrNull(number_of_dependents);
  const ageNum = toNumberOrNull(age);
  const savingsNum = toNumberOrNull(savings);

  // Retrieve file names from req.files (using multiUpload middleware)
  const id_picture =
    req.files && req.files.id_picture && req.files.id_picture[0]
      ? req.files.id_picture[0].filename
      : null;
  const barangayClearance =
    req.files && req.files.barangay_clearance && req.files.barangay_clearance[0]
      ? req.files.barangay_clearance[0].filename
      : null;
  const taxIdentificationId =
    req.files && req.files.tax_identification && req.files.tax_identification[0]
      ? req.files.tax_identification[0].filename
      : null;
  const validId =
    req.files && req.files.valid_id && req.files.valid_id[0]
      ? req.files.valid_id[0].filename
      : null;
  const membershipAgreement =
    req.files && req.files.membership_agreement && req.files.membership_agreement[0]
      ? req.files.membership_agreement[0].filename
      : null;

  // Format registration date (default to current date if not provided)
  const formattedRegistrationDate = registration_date
    ? formatDate(new Date(registration_date))
    : formatDate(new Date());

  // Build sanitized data object ensuring missing values are set to null.
  // Note: We trim string inputs to remove extra whitespace.
  const sanitizedData = {
    registration_type: registration_type !== undefined ? registration_type : null,
    registration_date: formattedRegistrationDate,
    annual_income: annual_incomeNum,
    number_of_dependents: number_of_dependentsNum,
    last_name: last_name ? last_name.trim() : null,
    first_name: first_name ? first_name.trim() : null,
    middle_name: middle_name ? middle_name.trim() : null,
    maiden_name: maiden_name ? maiden_name.trim() : null,
    extension_name: extension_name ? extension_name.trim() : null,
    religion: religion ? religion.trim() : null,
    tin_number: tin_number ? tin_number.trim() : null,
    date_of_birth: date_of_birth ? date_of_birth : null,
    birthplace_province: birthplace_province ? birthplace_province.trim() : null,
    age: ageNum,
    sex: sex ? sex.trim() : null,
    civil_status: civil_status ? civil_status.trim() : null,
    highest_educational_attainment: highest_educational_attainment
      ? highest_educational_attainment.trim()
      : null,
    occupation_source_of_income: occupation_source_of_income
      ? occupation_source_of_income.trim()
      : null,
    spouse_name: spouse_name ? spouse_name.trim() : null,
    spouse_occupation_source_of_income: spouse_occupation_source_of_income
      ? spouse_occupation_source_of_income.trim()
      : null,
    primary_beneficiary_name: primary_beneficiary_name
      ? primary_beneficiary_name.trim()
      : null,
    primary_beneficiary_relationship: primary_beneficiary_relationship
      ? primary_beneficiary_relationship.trim()
      : null,
    primary_beneficiary_contact: primary_beneficiary_contact
      ? primary_beneficiary_contact.trim()
      : null,
    secondary_beneficiary_name: secondary_beneficiary_name
      ? secondary_beneficiary_name.trim()
      : null,
    secondary_beneficiary_relationship: secondary_beneficiary_relationship
      ? secondary_beneficiary_relationship.trim()
      : null,
    secondary_beneficiary_contact: secondary_beneficiary_contact
      ? secondary_beneficiary_contact.trim()
      : null,
    contact_number: contact_number ? contact_number.trim() : null,
    house_no_street: house_no_street ? house_no_street.trim() : null,
    barangay: barangay ? barangay.trim() : null,
    city: city ? city.trim() : null,
    reference_name: reference_name ? reference_name.trim() : null,
    position: position ? position.trim() : null,
    reference_contact: reference_contact ? reference_contact.trim() : null,
    email: email ? email.trim() : null,
    password: password ? password.trim() : null,
    id_picture,
    barangay_clearance: barangayClearance,
    tax_identification_id: taxIdentificationId,
    valid_id: validId,
    membership_agreement: membershipAgreement,
    savings: savingsNum
  };

  // For testing, we use the helper to check if the application is complete.
  // Here, only "last_name" is required.
  const status = isApplicationComplete(sanitizedData) ? "Completed" : "Incomplete";
  // Attach status to our data object.
  sanitizedData.status = status;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Insert into members table.
    // Note: We now include the "status" column in the query.
    const memberQuery = `
      INSERT INTO members 
        (registration_type, registration_date, annual_income,
         number_of_dependents, last_name, first_name, middle_name,
         maiden_name, extension_name, religion, tin_number, date_of_birth,
         birthplace_province, age, sex, civil_status, highest_educational_attainment,
         occupation_source_of_income, spouse_name, spouse_occupation_source_of_income,
         contact_number, house_no_street, barangay, city, id_picture,
         barangay_clearance, tax_identification_id, valid_id, membership_agreement, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const memberParams = [
      sanitizedData.registration_type,
      sanitizedData.registration_date,
      sanitizedData.annual_income,
      sanitizedData.number_of_dependents,
      sanitizedData.last_name,
      sanitizedData.first_name,
      sanitizedData.middle_name,
      sanitizedData.maiden_name,
      sanitizedData.extension_name,
      sanitizedData.religion,
      sanitizedData.tin_number,
      sanitizedData.date_of_birth,
      sanitizedData.birthplace_province,
      sanitizedData.age,
      sanitizedData.sex,
      sanitizedData.civil_status,
      sanitizedData.highest_educational_attainment,
      sanitizedData.occupation_source_of_income,
      sanitizedData.spouse_name,
      sanitizedData.spouse_occupation_source_of_income,
      sanitizedData.contact_number,
      sanitizedData.house_no_street,
      sanitizedData.barangay,
      sanitizedData.city,
      sanitizedData.id_picture,
      sanitizedData.barangay_clearance,
      sanitizedData.tax_identification_id,
      sanitizedData.valid_id,
      sanitizedData.membership_agreement,
      sanitizedData.status
    ];
    const [memberResult] = await connection.execute(memberQuery, memberParams);

    if (memberResult.affectedRows === 0) {
      throw new Error("Failed to insert member information");
    }

    // Use a new variable name for the generated member id.
    const newMemberId = memberResult.insertId;

    // INSERT primary beneficiary if provided.
    if (sanitizedData.primary_beneficiary_name) {
      const primaryBeneficiaryQuery = `
        INSERT INTO beneficiaries 
          (memberId, beneficiaryName, relationship, beneficiaryContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const primaryBeneficiaryParams = [
        newMemberId,
        sanitizedData.primary_beneficiary_name,
        sanitizedData.primary_beneficiary_relationship,
        sanitizedData.primary_beneficiary_contact
      ];
      await connection.execute(primaryBeneficiaryQuery, primaryBeneficiaryParams);
    }

    // INSERT secondary beneficiary if provided.
    if (sanitizedData.secondary_beneficiary_name) {
      const secondaryBeneficiaryQuery = `
        INSERT INTO beneficiaries 
          (memberId, beneficiaryName, relationship, beneficiaryContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const secondaryBeneficiaryParams = [
        newMemberId,
        sanitizedData.secondary_beneficiary_name,
        sanitizedData.secondary_beneficiary_relationship,
        sanitizedData.secondary_beneficiary_contact
      ];
      await connection.execute(secondaryBeneficiaryQuery, secondaryBeneficiaryParams);
    }

    // INSERT character reference if provided.
    if (sanitizedData.reference_name) {
      const characterReferencesQuery = `
        INSERT INTO character_references 
          (memberId, referenceName, \`position\`, referenceContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const characterReferencesParams = [
        newMemberId,
        sanitizedData.reference_name,
        sanitizedData.position,
        sanitizedData.reference_contact
      ];
      await connection.execute(characterReferencesQuery, characterReferencesParams);
    }

    await connection.commit();
    res.status(201).json({
      message: "Application successfully submitted",
      status: sanitizedData.status,
      id_picture: sanitizedData.id_picture
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error during member insertion:", error);
    res.status(500).json({ message: "Error adding member", error: error.message });
  } finally {
    connection.release();
  }
};


exports.getMemberSavings = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
     SELECT 
    CONCAT(m.first_name, ' ', m.last_name) AS fullName,
    m.*, 
    s.amount AS savingsAmount,
    s.account_number,
    s.remarks AS savingsStatus  
      FROM 
          members m
      LEFT JOIN 
          regular_savings s
      ON 
          m.memberId = s.memberId;

    `;

    const [rows] = await connection.execute(query);

    res.status(200).json({ message: "Members retrieved successfully", data: rows });
  } catch (error) {
    console.error("Error retrieving members:", error);
    res.status(500).json({ message: "Error retrieving members", error: error.message });
  } finally {
    connection.release();
  }
};



exports.updateMember = async (req, res) => {
  const id = req.params.id;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ message: 'Invalid member ID' });
  }

  // Destructure all expected fields from req.body
  const {
    registration_type,
    last_name,
    first_name,
    middle_name,
    extension_name,
    tin_number,
    date_of_birth,
    birthplace_province,
    number_of_dependents,
    age,
    sex,
    civil_status,
    religion,
    highest_educational_attainment,
    annual_income,
    occupation_source_of_income,
    spouse_name,
    spouse_occupation_source_of_income,
    contact_number,
    house_no_street,
    barangay,
    city,
    tax_identification_id,
  } = req.body;

  // File-based columns: if files are provided via req.file or req.files
  // Here we assume the filenames for these fields are provided in req.body,
  // or you can customize this to check req.files if you're uploading files.
  const barangay_clearance = req.body.barangay_clearance || (req.files && req.files.barangay_clearance ? req.files.barangay_clearance[0].filename : null);
  const valid_id = req.body.valid_id || (req.files && req.files.valid_id ? req.files.valid_id[0].filename : null);
  const membership_agreement = req.body.membership_agreement || (req.files && req.files.membership_agreement ? req.files.membership_agreement[0].filename : null);

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const updateQuery = `
      UPDATE members
      SET 
        registration_type = ?,
        last_name = ?,
        first_name = ?,
        middle_name = ?,
        extension_name = ?,
        tin_number = ?,
        date_of_birth = ?,
        birthplace_province = ?,
        number_of_dependents = ?,
        age = ?,
        sex = ?,
        civil_status = ?,
        religion = ?,
        highest_educational_attainment = ?,
        annual_income = ?,
        occupation_source_of_income = ?,
        spouse_name = ?,
        spouse_occupation_source_of_income = ?,
        contact_number = ?,
        house_no_street = ?,
        barangay = ?,
        city = ?,
        barangay_clearance = ?,
        tax_identification_id = ?,
        valid_id = ?,
        membership_agreement = ?
      WHERE memberId = ?
    `;
    const params = [
      registration_type,
      last_name,
      first_name,
      middle_name,
      extension_name,
      tin_number,
      date_of_birth,
      birthplace_province,
      number_of_dependents,
      age,
      sex,
      civil_status,
      religion,
      highest_educational_attainment,
      annual_income,
      occupation_source_of_income,
      spouse_name,
      spouse_occupation_source_of_income,
      contact_number,
      house_no_street,
      barangay,
      city,
      barangay_clearance,
      tax_identification_id,
      valid_id,
      membership_agreement,
      id
    ];

    await connection.execute(updateQuery, params);
    await connection.commit();
    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating member data:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Error updating member information' });
  } finally {
    await connection.release();
  }
};





// Delete a member
exports.deleteMember = async (req, res) => {
  const id = req.params.id;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ message: 'Invalid member ID' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const accountQuery = "DELETE FROM member_account WHERE memberId = ?";
    await connection.execute(accountQuery, [id]);

    const memberQuery = "DELETE FROM members WHERE memberId = ?";
    const memberResult = await connection.execute(memberQuery, [id]);

    await connection.commit();

    if (memberResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from MySQL:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Error deleting member' });
  } finally {
    connection.release();
  }
};





exports.activateAccount = async (req, res) => {
  const { memberId } = req.params;  // Get memberId from the request parameters
  
  try {
    const result = await memberModel.activateAccount(memberId); 

    if (result && result.affectedRows > 0) {
      return res.status(200).json({ message: 'Account activated successfully!' });
    } else {
      return res.status(404).json({ message: 'Member not found or already activated' });
    }
  } catch (error) {
    console.error('Error activating account:', error);
    return res.status(500).json({ message: 'Error activating account' });
  }
};

exports.getAllMemberApplicants = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const query = `
      SELECT 
        m.*, 
        ma.email, 
        ma.password, 
        ma.accountStatus, 
        b.beneficiaryName, 
        b.relationship, 
        b.beneficiaryContactNumber, 
        c.referenceName, 
        c.position, 
        c.referenceContactNumber,
        s.amount AS savingsAmount
      FROM members m
      LEFT JOIN member_account ma ON m.memberId = ma.memberId
      LEFT JOIN beneficiaries b ON m.memberId = b.memberId
      LEFT JOIN character_references c ON m.memberId = c.memberId
      LEFT JOIN regular_savings s ON m.memberId = s.memberId
      WHERE m.status IN ('Incomplete', 'Completed')
    `;

    const rows = await connection.execute(query);
    res.status(200).json({ message: "Member applicants retrieved successfully", data: rows });
  } catch (error) {
    console.error("Error retrieving member applicants:", error);
    res.status(500).json({ message: "Error retrieving member applicants", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};



exports.getMemberByEmail = async (req, res) => {
  try {
    const { email } = req.params; // Get email from the request URL parameters

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const member = await memberModel.getMemberByEmail(email);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.status(200).json(member);
  } catch (error) {
    console.error('Error fetching member by email:', error.message);
    res.status(500).json({ error: 'Failed to fetch member data' });
  }
};


// controllers/memberController.js

exports.updateFinancials = async (req, res) => {
  try {
    const memberId = req.params.memberId; // Expecting memberId in the route parameters
    const result = await updateMemberFinancials(memberId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating member financials:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addPurchaseHistory = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const { service, amount } = req.body;

    if (!service || amount == null) {
      return res.status(400).json({ message: "Service and amount are required." });
    }

    const result = await memberModel.addPurchaseHistory(memberId, service, amount);
    res.status(200).json({ message: "Purchase history added successfully.", result });
  } catch (error) {
    console.error("Error adding purchase history:", error);
    res.status(500).json({ message: error.message });
  }
};

