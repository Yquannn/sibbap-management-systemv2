import React, { useState } from 'react';
import TableWithGrouping from '../components/datagrid/GridComponent';

const FileMaintenance = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [file, setFile] = useState(null);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);  // Assuming only one file is uploaded
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure all fields are filled
    if (!selectedMonth || !selectedService || !file) {
      alert('All fields are required.');
      return; // Stop the submission if any field is missing
    }

    const formData = new FormData();
    formData.append('month', selectedMonth);
    formData.append('service', selectedService);
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/maintenance', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json(); 
      if (response.ok) {
        console.log('Success:', result);
        alert('Maintenance data added successfully!');
        // Reset the form fields
        setSelectedMonth('');
        setSelectedService('');
        setFile(null);
        // Optionally, if using a form element reference, reset the form directly:
        // event.target.reset(); // This would reset the entire form including the file input
      } else {
        throw new Error(result.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form: ' + error.message);
    }
};

  const months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
  const services = ["CONSUMER STORE", "BAKERY PRODUCTION", "GARMENTS PRODUCTION", "ATM WITHDRAW & BALANCE", "GCASH (IN & OUT)", "PRINTING SERVICES", "PSA, CENOMAR, DEATH CERT", "TRUEMONEY"];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">File Maintenance</h2>
      <form onSubmit={handleSubmit}>
        <div className='flex flex-wrap'>
          <div className="mb-4 flex-1 min-w-[280px]">
            <label htmlFor="month-select" className="block text-lg font-medium text-gray-700">Select Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">--Please choose a month--</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex-1 min-w-[280px]">
            <label htmlFor="service-select" className="block text-lg font-medium text-gray-700">Select Service:</label>
            <select
              id="service-select"
              value={selectedService}
              onChange={handleServiceChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">--Please choose a service--</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex-1 min-w-[280px]">
            <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700">Attach File:</label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-violet-100"
            />
          </div>

          <div className="mt-6 flex-1 min-w-[280px]">
            <button type="submit" className="w-full bg-green-500 text-sm text-white font-bold rounded hover:bg-green-600">
              Submit
            </button>
          </div>
        </div>
      </form>
      <TableWithGrouping/>
    </div>
  );
};

export default FileMaintenance;
