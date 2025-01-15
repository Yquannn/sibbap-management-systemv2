const db = require('../config/db');
const memberModel= require('../models/memberModel')

const { queryDatabase, generateUniqueMemberId, formatDate } = require('../utils/databaseHelper');
exports.getMembers = async (req, res) => {
  const memberName = req.query.name;
  
  let query = `
    SELECT mi.*, 
           ma.email, 
           ma.password, 
           ma.accountStatus, 
           b.beneficiaryName, 
           b.relationship, 
           b.beneficiaryContactNumber, 
           c.referenceName, 
           c.position, 
           c.referenceContactNumber
    FROM members mi
    LEFT JOIN member_account ma ON mi.memberId = ma.memberId
    LEFT JOIN beneficiaries b ON mi.memberId = b.memberId
    LEFT JOIN character_references c ON mi.memberId = c.memberId`;

  const queryParams = [];

  if (memberName) {
    query += ' WHERE LOWER(mi.fullName) = ?';  // Filtering by member name if provided
    queryParams.push(memberName.toLowerCase());
  }

  try {
    const members = await queryDatabase(query, queryParams);

    if (members.length > 0) {
      // Create a map to store members by memberId to avoid duplicates
      const memberMap = new Map();

      members.forEach(member => {
        // If the member is not in the map, add it
        if (!memberMap.has(member.memberId)) {
          memberMap.set(member.memberId, {
            ...member,
            beneficiaries: [],
            references: []
          });
        }

        // Add the beneficiary data
        if (member.beneficiaryName) {
          memberMap.get(member.memberId).beneficiaries.push({
            beneficiaryName: member.beneficiaryName,
            relationship: member.relationship,
            beneficiaryContactNumber: member.beneficiaryContactNumber
          });
        }

        // Add the reference data
        if (member.referenceName) {
          memberMap.get(member.memberId).references.push({
            referenceName: member.referenceName,
            position: member.position,
            referenceContactNumber: member.referenceContactNumber
          });
        }
      });

      // Convert the map back to an array and send the response
      res.json(Array.from(memberMap.values()));
    } else {
      res.status(404).json({ message: 'No members found' });
    }
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    res.status(500).json({ message: 'Error fetching data from MySQL' });
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



exports.addMember = async (req, res) => {
  const { 
    registrationType, memberType, registrationDate, shareCapital,
    fullNameLastName, fullNameFirstName, fullNameMiddleName, maidenName,
    tinNumber, dateOfBirth, birthplaceProvince, age, 
    sex, civilStatus, highestEducationalAttainment, 
    occupationSourceOfIncome, spouseName, spouseOccupationSourceOfIncome,
    primaryBeneficiaryName, primaryBeneficiaryRelationship, primaryBeneficiaryContact,
    secondaryBeneficiaryName, secondaryBeneficiaryRelationship, secondaryBeneficiaryContact,
    contactNumber, houseNoStreet, barangay, city, referenceName, position, referenceContact,
    email, password 
  } = req.body;

  const idPicture = req.file ? req.file.filename : null;
  const formattedRegistrationDate = registrationDate ? formatDate(new Date(registrationDate)) : formatDate(new Date());

  // Replace undefined with null in the fields that can be nullable
  const sanitizedData = {
    registrationType: registrationType || null,
    memberType: memberType || null,
    registrationDate: formattedRegistrationDate,
    shareCapital: shareCapital || null,
    fullNameLastName: fullNameLastName || null,
    fullNameFirstName: fullNameFirstName || null,
    fullNameMiddleName: fullNameMiddleName || null,
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
    idPicture: idPicture || null
  };

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction(); 

    const memberCode = await generateUniqueMemberId();
    
    // Insert member into the members table first
    const memberQuery = `
      INSERT INTO members 
      (memberCode, registrationType, memberType, registrationDate, shareCapital,
       fullNameLastName, fullNameFirstName, fullNameMiddleName, maidenName, 
       tinNumber, dateOfBirth, birthplaceProvince, age, sex, civilStatus, 
       highestEducationalAttainment, occupationSourceOfIncome, spouseName, 
       spouseOccupationSourceOfIncome, contactNumber, houseNoStreet, barangay, city, idPicture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const memberParams = [
      memberCode, sanitizedData.registrationType, sanitizedData.memberType, sanitizedData.registrationDate, sanitizedData.shareCapital,
      sanitizedData.fullNameLastName, sanitizedData.fullNameFirstName, sanitizedData.fullNameMiddleName, sanitizedData.maidenName,
      sanitizedData.tinNumber, sanitizedData.dateOfBirth, sanitizedData.birthplaceProvince, sanitizedData.age, sanitizedData.sex, sanitizedData.civilStatus,
      sanitizedData.highestEducationalAttainment, sanitizedData.occupationSourceOfIncome, sanitizedData.spouseName, 
      sanitizedData.spouseOccupationSourceOfIncome, sanitizedData.contactNumber, sanitizedData.houseNoStreet, sanitizedData.barangay, sanitizedData.city, sanitizedData.idPicture
    ];

    const [memberResult] = await connection.execute(memberQuery, memberParams);

    if (memberResult.affectedRows === 0) {
      throw new Error('Failed to insert member information');
    }

    const memberId = memberResult.insertId;  // Capture the memberId (insertId)

    // Determine account status based on email and password
    const accountStatus = email && password ? 'ACTIVE' : 'NOT ACTIVATED';

    // Insert into member_account with dynamic accountStatus
    const accountQuery = `
      INSERT INTO member_account 
      (memberId, email, password, accountStatus)
      VALUES (?, ?, ?, ?)
    `;
    const accountParams = [
      memberId, 
      sanitizedData.email, 
      sanitizedData.password, 
      accountStatus
    ];
    await connection.execute(accountQuery, accountParams);

    const primaryBeneficiaryQuery = `
      INSERT INTO beneficiaries 
      (memberId, beneficiaryName, relationship, beneficiaryContactNumber)
      VALUES (?, ?, ?, ?)
    `;
    const primaryBeneficiaryParams = [memberId, sanitizedData.primaryBeneficiaryName, sanitizedData.primaryBeneficiaryRelationship, sanitizedData.primaryBeneficiaryContact];
    await connection.execute(primaryBeneficiaryQuery, primaryBeneficiaryParams);

    // Insert secondary beneficiary
    const secondaryBeneficiaryQuery = `
      INSERT INTO beneficiaries 
      (memberId, beneficiaryName, relationship, beneficiaryContactNumber)
      VALUES (?, ?, ?, ?)
    `;
    const secondaryBeneficiaryParams = [memberId, sanitizedData.secondaryBeneficiaryName, sanitizedData.secondaryBeneficiaryRelationship, sanitizedData.secondaryBeneficiaryContact];
    await connection.execute(secondaryBeneficiaryQuery, secondaryBeneficiaryParams);

    const characterReferencesQuery = `
      INSERT INTO character_references 
      (memberId, referenceName, position, referenceContactNumber)
      VALUES (?, ?, ?, ?)
    `;
    const characterReferencesParams = [memberId, sanitizedData.referenceName, sanitizedData.position, sanitizedData.referenceContact];
    await connection.execute(characterReferencesQuery, characterReferencesParams);

    await connection.commit();

    res.status(201).json({ message: 'Member added successfully', idPicture });
  } catch (error) {
    console.error('Error inserting data into MySQL:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Error inserting data into MySQL' });
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