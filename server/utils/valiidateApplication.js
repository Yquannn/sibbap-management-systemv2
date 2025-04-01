// helper/validateApplication.js

/**
 * Checks if the application data contains all required fields.
 * You can expand the check (e.g., numeric validations) as needed.
 *
 * @param {Object} data - The application data object.
 * @returns {boolean} - Returns true if complete, false otherwise.
 */
function isApplicationComplete(data) {
    // List of required field names (as defined in your schema)
    const requiredFields = [
      "last_name",
      "first_name",
      "middle_name",
      "tin_number",
      "date_of_birth",
      "birthplace_province",
      "number_of_dependents",
      "age",
      "sex",
      "civil_status",
      "religion",
      "highest_educational_attainment",
      "annual_income",
      "occupation_source_of_income",
      "spouse_name",
      "spouse_occupation_source_of_income",
      "contact_number",
      "house_no_street"
    ];
  
    for (const field of requiredFields) {
      // For numeric values (e.g., share_capital), a zero value might be acceptable.
      // Adjust the check as needed (for example, if you require non-zero values).
      if (data[field] === undefined || data[field] === null) {
        return false;
      }
      // If the field is a string, ensure it's not just empty whitespace.
      if (typeof data[field] === 'string' && data[field].trim() === '') {
        return false;
      }
    }
    return true;
  }
  
  module.exports = { isApplicationComplete };
  