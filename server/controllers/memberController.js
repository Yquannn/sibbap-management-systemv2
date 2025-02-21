const db = require('../config/db');
const memberModel= require('../models/memberModel')

const { queryDatabase, generateUniqueMemberId, formatDate } = require('../utils/databaseHelper');



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



exports.addMember = async (req, res) => {
  const {
    registration_type,
    member_type,
    registration_date,
    share_capital,
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
    savings,
    identification_card_fee,
    membership_fee,
    kalinga_fund_fee,
    initial_savings
  } = req.body;

  // Convert numeric fields (they come as strings from FormData)
  const share_capitalNum = Number(share_capital) || 0;
  const annual_incomeNum = Number(annual_income) || 0;
  const number_of_dependentsNum = Number(number_of_dependents) || 0;
  const ageNum = Number(age) || null;
  const identification_card_fee_num = Number(identification_card_fee) || 0;
  const membership_fee_num = Number(membership_fee) || 0;
  const kalinga_fund_fee_num = Number(kalinga_fund_fee) || 0;
  const initial_savings_num = Number(initial_savings) || 0;

  // If files were uploaded, get their filenames.
  // (Assumes that your file upload middleware populates req.file for idPicture 
  // and req.files for the additional documents)
  const id_picture = req.file ? req.file.filename : null;
  const barangayClearance = req.files && req.files.barangay_clearance ? req.files.barangay_clearance[0].filename : null;
  const taxIdentificationId = req.files && req.files.tax_identification ? req.files.tax_identification[0].filename : null;
  const validId = req.files && req.files.valid_id ? req.files.valid_id[0].filename : null;
  const membershipAgreement = req.files && req.files.membership_agreement ? req.files.membership_agreement[0].filename : null;

  const formattedRegistrationDate = registration_date
    ? formatDate(new Date(registration_date))
    : formatDate(new Date());

  // Adjust share capital and prepare additional savings (example logic)
  const adjustedShareCapital = Math.max(0, share_capitalNum - 100);
  const additionalSavings = share_capitalNum >= 100 ? 100 : 0;

  // Build a sanitized data object using snake_case keys and include the new document fields
  const sanitizedData = {
    registration_type: registration_type || null,
    member_type: member_type || "Regular member",
    registration_date: formattedRegistrationDate,
    share_capital: adjustedShareCapital,
    annual_income: annual_incomeNum,
    number_of_dependents: number_of_dependentsNum,
    last_name: last_name || null,
    first_name: first_name || null,
    middle_name: middle_name || null,
    maiden_name: maiden_name || null,
    extension_name: extension_name || null,
    religion: religion || null,
    tin_number: tin_number || null,
    date_of_birth: date_of_birth || null,
    birthplace_province: birthplace_province || null,
    age: ageNum,
    sex: sex || null,
    civil_status: civil_status || null,
    highest_educational_attainment: highest_educational_attainment || null,
    occupation_source_of_income: occupation_source_of_income || null,
    spouse_name: spouse_name || null,
    spouse_occupation_source_of_income: spouse_occupation_source_of_income || null,
    primary_beneficiary_name: primary_beneficiary_name || null,
    primary_beneficiary_relationship: primary_beneficiary_relationship || null,
    primary_beneficiary_contact: primary_beneficiary_contact || null,
    secondary_beneficiary_name: secondary_beneficiary_name || null,
    secondary_beneficiary_relationship: secondary_beneficiary_relationship || null,
    secondary_beneficiary_contact: secondary_beneficiary_contact || null,
    contact_number: contact_number || null,
    house_no_street: house_no_street || null,
    barangay: barangay || null,
    city: city || null,
    reference_name: reference_name || null,
    position: position || null,
    reference_contact: reference_contact || null,
    email: email || null,
    password: password || null,
    id_picture: id_picture || null,
    barangay_clearance: barangayClearance || null,
    tax_identification_id: taxIdentificationId || null,
    valid_id: validId || null,
    membership_agreement: membershipAgreement || null,
    savings: additionalSavings,
    identification_card_fee: identification_card_fee_num,
    membership_fee: membership_fee_num,
    kalinga_fund_fee: kalinga_fund_fee_num,
    initial_savings: initial_savings_num
  };

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Generate a unique member code (e.g., "MEM123456")
    const memberCode = await generateUniqueMemberId();

    // INSERT into the members table using snake_case column names.
    // Note: The query has been updated to include the new document columns.
    const memberQuery = `
      INSERT INTO members 
        (memberCode, registration_type, member_type, registration_date, share_capital, annual_income, number_of_dependents,
         last_name, first_name, middle_name, maiden_name, extension_name, religion,
         tin_number, date_of_birth, birthplace_province, age, sex, civil_status, 
         highest_educational_attainment, occupation_source_of_income, spouse_name, 
         spouse_occupation_source_of_income, contact_number, house_no_street, barangay, city, id_picture,
         barangay_clearance, tax_identification_id, valid_id, membership_agreement,
         identification_card_fee, membership_fee, kalinga_fund_fee, initial_savings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const memberParams = [
      memberCode,
      sanitizedData.registration_type,
      sanitizedData.member_type,
      sanitizedData.registration_date,
      sanitizedData.share_capital,
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
      sanitizedData.identification_card_fee,
      sanitizedData.membership_fee,
      sanitizedData.kalinga_fund_fee,
      sanitizedData.initial_savings
    ];
    const [memberResult] = await connection.execute(memberQuery, memberParams);

    if (memberResult.affectedRows === 0) {
      throw new Error("Failed to insert member information");
    }

    const memberId = memberResult.insertId;

    // INSERT into member_account table using snake_case column names
    const accountStatus = email && password ? "ACTIVE" : "NOT ACTIVATED";
    const accountQuery = `
      INSERT INTO member_account
        (memberId, email, password, accountStatus)
      VALUES (?, ?, ?, ?)
    `;
    const accountParams = [memberId, sanitizedData.email, sanitizedData.password, accountStatus];
    await connection.execute(accountQuery, accountParams);

    // INSERT primary beneficiary if provided
    if (sanitizedData.primary_beneficiary_name) {
      const primaryBeneficiaryQuery = `
        INSERT INTO beneficiaries 
          (memberId, beneficiaryName, relationship, beneficiaryContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const primaryBeneficiaryParams = [
        memberId,
        sanitizedData.primary_beneficiary_name,
        sanitizedData.primary_beneficiary_relationship,
        sanitizedData.primary_beneficiary_contact
      ];
      await connection.execute(primaryBeneficiaryQuery, primaryBeneficiaryParams);
    }

    // INSERT secondary beneficiary if provided
    if (sanitizedData.secondary_beneficiary_name) {
      const secondaryBeneficiaryQuery = `
        INSERT INTO beneficiaries 
          (memberId, beneficiaryName, relationship, beneficiaryContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const secondaryBeneficiaryParams = [
        memberId,
        sanitizedData.secondary_beneficiary_name,
        sanitizedData.secondary_beneficiary_relationship,
        sanitizedData.secondary_beneficiary_contact
      ];
      await connection.execute(secondaryBeneficiaryQuery, secondaryBeneficiaryParams);
    }

    // INSERT character reference if provided
    if (sanitizedData.reference_name) {
      const characterReferencesQuery = `
        INSERT INTO character_references 
          (memberId, referenceName, position, referenceContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const characterReferencesParams = [
        memberId,
        sanitizedData.reference_name,
        sanitizedData.position,
        sanitizedData.reference_contact
      ];
      await connection.execute(characterReferencesQuery, characterReferencesParams);
    }

    // INSERT into regular_savings if applicable
    if (sanitizedData.savings > 0) {
      const savingsQuery = `
        INSERT INTO regular_savings 
          (memberId, amount)
        VALUES (?, ?)
      `;
      const savingsParams = [memberId, sanitizedData.savings];
      await connection.execute(savingsQuery, savingsParams);
    }

    await connection.commit();
    res.status(201).json({ message: "Member added successfully", id_picture: sanitizedData.id_picture });
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




// Update member details
exports.updateMember = async (req, res) => {
  const id = req.params.id; 
  const { fullName, age, contactNumber, gender, address, shareCapital, email, password } = req.body;
  const idPicture = req.file ? req.file.filename : null; 

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ message: 'Invalid member ID' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let memberQuery = `
      UPDATE member_information
      SET 
        fullName = ?, 
        age = ?, 
        contactNumber = ?, 
        gender = ?, 
        address = ?, 
        shareCapital = ?
    `;
    const memberParams = [fullName, age, contactNumber, gender, address, shareCapital];

    if (idPicture) {
      memberQuery += `, idPicture = ?`; 
      memberParams.push(idPicture);
    }

    memberQuery += ` WHERE id = ?`; 
    memberParams.push(id);

    await connection.execute(memberQuery, memberParams);

    if (password) {
      const accountQuery = `
        UPDATE member_account
        SET email = ?, password = ?
        WHERE memberId = ?  
      `;
      const accountParams = [email, password, id]; 
      await connection.execute(accountQuery, accountParams);
    } else {
      const accountQuery = `
        UPDATE member_account
        SET email = ?
        WHERE memberId = ?  
      `;
      const accountParams = [email, id]; 
      await connection.execute(accountQuery, accountParams);
    }

    await connection.commit();

    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating data in MySQL:', error);
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
