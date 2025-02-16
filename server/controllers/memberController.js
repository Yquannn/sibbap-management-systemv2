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
    registrationType, memberType, registrationDate, shareCapital,
    LastName, FirstName, MiddleName, maidenName,
    tinNumber, dateOfBirth, birthplaceProvince, age,
    sex, civilStatus, highestEducationalAttainment,
    occupationSourceOfIncome, spouseName, spouseOccupationSourceOfIncome,
    primaryBeneficiaryName, primaryBeneficiaryRelationship, primaryBeneficiaryContact,
    secondaryBeneficiaryName, secondaryBeneficiaryRelationship, secondaryBeneficiaryContact,
    contactNumber, houseNoStreet, barangay, city, referenceName, position, referenceContact,
    email, password, savings
  } = req.body;

  const idPicture = req.file ? req.file.filename : null;
  const formattedRegistrationDate = registrationDate
    ? formatDate(new Date(registrationDate))
    : formatDate(new Date());

  // Adjust share capital and prepare to add to savings
  const adjustedShareCapital = Math.max(0, shareCapital - 100); // Ensures share capital doesn't go negative
  const additionalSavings = shareCapital >= 100 ? 100 : 0; // Only add 100 to savings if there was at least 100 in share capital

  // Sanitize and validate data
  const sanitizedData = {
    registrationType: registrationType || null,
    memberType: memberType || null,
    registrationDate: formattedRegistrationDate,
    shareCapital: adjustedShareCapital,
    LastName: LastName || null,
    FirstName: FirstName || null,
    MiddleName: MiddleName || null,
    maidenName: maidenName || null,
    tinNumber: tinNumber || null,
    dateOfBirth: dateOfBirth || null,
    birthplaceProvince: birthplaceProvince || null,
    age: age || null,
    sex: sex || null,
    civilStatus: civilStatus || null,
    highestEducationalAttainment: highestEducationalAttainment || null,
    occupationSourceOfIncome: occupationSourceOfIncome || null,
    spouseName: spouseName || null,
    spouseOccupationSourceOfIncome: spouseOccupationSourceOfIncome || null,
    primaryBeneficiaryName: primaryBeneficiaryName || null,
    primaryBeneficiaryRelationship: primaryBeneficiaryRelationship || null,
    primaryBeneficiaryContact: primaryBeneficiaryContact || null,
    secondaryBeneficiaryName: secondaryBeneficiaryName || null,
    secondaryBeneficiaryRelationship: secondaryBeneficiaryRelationship || null,
    secondaryBeneficiaryContact: secondaryBeneficiaryContact || null,
    contactNumber: contactNumber || null,
    houseNoStreet: houseNoStreet || null,
    barangay: barangay || null,
    city: city || null,
    referenceName: referenceName || null,
    position: position || null,
    referenceContact: referenceContact || null,
    email: email || null,
    password: password || null,
    idPicture: idPicture || null,
    savings: additionalSavings
  };

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Generate unique member code
    const memberCode = await generateUniqueMemberId();

    // Insert member data
    const memberQuery = `
      INSERT INTO members 
        (memberCode, registrationType, memberType, registrationDate, shareCapital,
        LastName, FirstName, MiddleName, maidenName, 
        tinNumber, dateOfBirth, birthplaceProvince, age, sex, civilStatus, 
        highestEducationalAttainment, occupationSourceOfIncome, spouseName, 
        spouseOccupationSourceOfIncome, contactNumber, houseNoStreet, barangay, city, idPicture)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const memberParams = [
      memberCode, sanitizedData.registrationType, sanitizedData.memberType, sanitizedData.registrationDate, sanitizedData.shareCapital,
      sanitizedData.LastName, sanitizedData.FirstName, sanitizedData.MiddleName, sanitizedData.maidenName,
      sanitizedData.tinNumber, sanitizedData.dateOfBirth, sanitizedData.birthplaceProvince, sanitizedData.age, sanitizedData.sex, sanitizedData.civilStatus,
      sanitizedData.highestEducationalAttainment, sanitizedData.occupationSourceOfIncome, sanitizedData.spouseName,
      sanitizedData.spouseOccupationSourceOfIncome, sanitizedData.contactNumber, sanitizedData.houseNoStreet, sanitizedData.barangay, sanitizedData.city, sanitizedData.idPicture
    ];
    const [memberResult] = await connection.execute(memberQuery, memberParams);

    if (memberResult.affectedRows === 0) {
      throw new Error("Failed to insert member information");
    }

    const memberId = memberResult.insertId;

    // Insert member account
    const accountStatus = email && password ? "ACTIVE" : "NOT ACTIVATED";
    const accountQuery = `
      INSERT INTO member_account
      (memberId, email, password, accountStatus)
      VALUES (?, ?, ?, ?)
    `;
    const accountParams = [memberId, sanitizedData.email, sanitizedData.password, accountStatus];
    await connection.execute(accountQuery, accountParams);

    // Insert beneficiaries and references
    if (sanitizedData.primaryBeneficiaryName) {
      const primaryBeneficiaryQuery = `
        INSERT INTO beneficiaries (memberId, beneficiaryName, relationship, beneficiaryContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const primaryBeneficiaryParams = [memberId, sanitizedData.primaryBeneficiaryName, sanitizedData.primaryBeneficiaryRelationship, sanitizedData.primaryBeneficiaryContact];
      await connection.execute(primaryBeneficiaryQuery, primaryBeneficiaryParams);
    }

    if (sanitizedData.secondaryBeneficiaryName) {
      const secondaryBeneficiaryQuery = `
        INSERT INTO beneficiaries (memberId, beneficiaryName, relationship, beneficiaryContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const secondaryBeneficiaryParams = [memberId, sanitizedData.secondaryBeneficiaryName, sanitizedData.secondaryBeneficiaryRelationship, sanitizedData.secondaryBeneficiaryContact];
      await connection.execute(secondaryBeneficiaryQuery, secondaryBeneficiaryParams);
    }

    if (sanitizedData.referenceName) {
      const characterReferencesQuery = `
        INSERT INTO character_references (memberId, referenceName, position, referenceContactNumber)
        VALUES (?, ?, ?, ?)
      `;
      const characterReferencesParams = [memberId, sanitizedData.referenceName, sanitizedData.position, sanitizedData.referenceContact];
      await connection.execute(characterReferencesQuery, characterReferencesParams);
    }

    // Insert into savings table
    if (sanitizedData.savings > 0) {
      const savingsQuery = `
        INSERT INTO regular_savings (memberId, amount)
        VALUES (?, ?)
      `;
      const savingsParams = [memberId, sanitizedData.savings];
      await connection.execute(savingsQuery, savingsParams);
    }

    await connection.commit();
    res.status(201).json({ message: "Member added successfully", idPicture });
  } catch (error) {
    await connection.rollback();
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
    CONCAT(m.FirstName, ' ', m.LastName) AS fullName,
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
