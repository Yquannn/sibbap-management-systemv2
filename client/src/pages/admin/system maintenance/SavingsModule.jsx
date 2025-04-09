import React, { useReducer, useState } from 'react';

// ----- INITIAL STATE & REDUCER -----

const initialState = {
  savings: [
    { id: 1, accountName: 'Regular Savings', balance: 5000, interest: 1.2, lastDeposit: '2025-03-15' },
    { id: 2, accountName: 'Emergency Fund', balance: 12000, interest: 1.5, lastDeposit: '2025-03-20' },
    { id: 3, accountName: 'Holiday Savings', balance: 3000, interest: 1.0, lastDeposit: '2025-04-01' },
  ],
  announcements: [
    { id: 1, title: 'System Update', content: 'System update scheduled for May 01, 2025.' },
    { id: 2, title: 'New Feature', content: 'A new announcement has been added!' },
    { id: 3, title: 'Dummy Announcement', content: 'This is a dummy announcement for demonstration purposes.' },
  ],
  archivedItems: [
    { id: 101, type: 'Announcement', title: 'Old Announcement', content: 'Archived announcement details' },
  ],
  maintenance: {
    lastMaintenance: '2025-04-01',
    nextMaintenance: '2025-05-01',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_SAVINGS':
      return { ...state, savings: [...state.savings, action.payload] };
    case 'EDIT_SAVINGS':
      return {
        ...state,
        savings: state.savings.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'ARCHIVE_SAVINGS':
      return {
        ...state,
        savings: state.savings.filter((s) => s.id !== action.payload.id),
        archivedItems: [...state.archivedItems, { ...action.payload, type: 'Savings' }],
      };
    case 'ADD_ANNOUNCEMENT':
      return {
        ...state,
        announcements: [...state.announcements, action.payload],
      };
    case 'EDIT_ANNOUNCEMENT':
      return {
        ...state,
        announcements: state.announcements.map((ann) =>
          ann.id === action.payload.id ? action.payload : ann
        ),
      };
    case 'ARCHIVE_ANNOUNCEMENT':
      return {
        ...state,
        announcements: state.announcements.filter((ann) => ann.id !== action.payload.id),
        archivedItems: [...state.archivedItems, { ...action.payload, type: 'Announcement' }],
      };
    case 'EDIT_MAINTENANCE':
      return { ...state, maintenance: action.payload };
    case 'RESTORE_ARCHIVED': {
      const item = action.payload;
      if (item.type === 'Announcement') {
        return {
          ...state,
          announcements: [...state.announcements, { id: item.id, title: item.title, content: item.content }],
          archivedItems: state.archivedItems.filter((i) => i.id !== item.id),
        };
      } else if (item.type === 'Savings') {
        return {
          ...state,
          savings: [...state.savings, { id: item.id, accountName: item.accountName, balance: item.balance, interest: item.interest, lastDeposit: item.lastDeposit }],
          archivedItems: state.archivedItems.filter((i) => i.id !== item.id),
        };
      }
      return state;
    }
    case 'DELETE_ARCHIVED': {
      return {
        ...state,
        archivedItems: state.archivedItems.filter((i) => i.id !== action.payload.id),
      };
    }
    default:
      return state;
  }
}

// ----- MODAL COMPONENTS -----

const SavingsAccountModal = ({ onClose, onSave, initialData }) => {
  const [accountName, setAccountName] = useState(initialData ? initialData.accountName : '');
  const [balance, setBalance] = useState(initialData ? initialData.balance : '');
  const [interest, setInterest] = useState(initialData ? initialData.interest : '');
  const [lastDeposit, setLastDeposit] = useState(initialData ? initialData.lastDeposit : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const record = initialData
      ? { id: initialData.id, accountName, balance: Number(balance), interest: Number(interest), lastDeposit }
      : { id: Date.now(), accountName, balance: Number(balance), interest: Number(interest), lastDeposit };
    onSave(record);
    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3>{initialData ? 'Edit Savings Account' : 'Add Savings Account'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Account Name:</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              style={styles.inputField}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>Balance (Peso):</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              style={styles.inputField}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>Interest Rate (%):</label>
            <input
              type="number"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              style={styles.inputField}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>Last Deposit Date:</label>
            <input
              type="date"
              value={lastDeposit}
              onChange={(e) => setLastDeposit(e.target.value)}
              style={styles.inputField}
              required
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={styles.primaryButton}>Save</button>
            <button type="button" onClick={onClose} style={styles.secondaryButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AnnouncementModal = ({ onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData ? initialData.title : '');
  const [content, setContent] = useState(initialData ? initialData.content : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const announcementRecord = initialData
      ? { id: initialData.id, title, content }
      : { id: Date.now(), title, content };
    onSave(announcementRecord);
    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3>{initialData ? 'Edit Announcement' : 'Add Announcement'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.inputField}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={styles.inputField}
              required
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={styles.primaryButton}>Save</button>
            <button type="button" onClick={onClose} style={styles.secondaryButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MaintenanceScheduleModal = ({ onClose, onSave, initialData }) => {
  const [lastMaintenance, setLastMaintenance] = useState(initialData.lastMaintenance);
  const [nextMaintenance, setNextMaintenance] = useState(initialData.nextMaintenance);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ lastMaintenance, nextMaintenance });
    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3>Edit Maintenance Schedule</h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Last Maintenance:</label>
            <input
              type="date"
              value={lastMaintenance}
              onChange={(e) => setLastMaintenance(e.target.value)}
              style={styles.inputField}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>Next Maintenance:</label>
            <input
              type="date"
              value={nextMaintenance}
              onChange={(e) => setNextMaintenance(e.target.value)}
              style={styles.inputField}
              required
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={styles.primaryButton}>Save</button>
            <button type="button" onClick={onClose} style={styles.secondaryButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----- MAIN COMPONENT -----

const SavingsModule = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [currentSavings, setCurrentSavings] = useState(null);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [filterValue, setFilterValue] = useState('');

  // Savings handlers.
  const addOrEditSavings = (savingsAccount) => {
    if (currentSavings) {
      dispatch({ type: 'EDIT_SAVINGS', payload: savingsAccount });
    } else {
      dispatch({ type: 'ADD_SAVINGS', payload: savingsAccount });
    }
  };

  const archiveSavings = (id) => {
    const savingsAccount = state.savings.find((s) => s.id === id);
    if (savingsAccount) {
      dispatch({ type: 'ARCHIVE_SAVINGS', payload: savingsAccount });
      setActiveTab('Archive');
    }
  };

  const editSavings = (savingsAccount) => {
    setCurrentSavings(savingsAccount);
    setShowSavingsModal(true);
  };

  // Announcements handlers.
  const addOrEditAnnouncement = (announcement) => {
    if (currentAnnouncement) {
      dispatch({ type: 'EDIT_ANNOUNCEMENT', payload: announcement });
    } else {
      dispatch({ type: 'ADD_ANNOUNCEMENT', payload: announcement });
    }
  };

  const archiveAnnouncement = (id) => {
    const ann = state.announcements.find((a) => a.id === id);
    if (ann) {
      dispatch({ type: 'ARCHIVE_ANNOUNCEMENT', payload: ann });
      setActiveTab('Archive');
    }
  };

  const editAnnouncement = (announcement) => {
    setCurrentAnnouncement(announcement);
    setShowAnnouncementModal(true);
  };

  // Maintenance handler.
  const editMaintenance = (newSchedule) => {
    dispatch({ type: 'EDIT_MAINTENANCE', payload: newSchedule });
  };

  // Restore handler for archived items.
  const restoreArchived = (item) => {
    dispatch({ type: 'RESTORE_ARCHIVED', payload: item });
    if (item.type === 'Announcement') {
      setActiveTab('Announcements');
    } else if (item.type === 'Savings') {
      setActiveTab('Savings Overview');
    }
  };

  // Permanent delete handler for archived items.
  const deleteArchived = (item) => {
    dispatch({ type: 'DELETE_ARCHIVED', payload: item });
  };

  // Render content based on active tab.
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div>
            <h2>Dashboard</h2>
            <p>
              This dashboard provides an overview of the system state. Changes in maintenance, savings, and announcements are all globally connected.
            </p>
          </div>
        );
      case 'Savings Overview':
        return (
          <section>
            <h2>Savings Overview</h2>
            <div style={styles.toolbar}>
              <button
                onClick={() => {
                  setCurrentSavings(null);
                  setShowSavingsModal(true);
                }}
                style={styles.primaryButton}
              >
                Add Savings Account
              </button>
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                style={styles.dropdown}
              >
                <option value="">All</option>
              </select>
            </div>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableCell}>ID</th>
                  <th style={styles.tableCell}>Account Name</th>
                  <th style={styles.tableCell}>Balance</th>
                  <th style={styles.tableCell}>Interest (%)</th>
                  <th style={styles.tableCell}>Last Deposit</th>
                  <th style={{ ...styles.tableCell, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.savings.map((s) => (
                  <tr key={s.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{s.id}</td>
                    <td style={styles.tableCell}>{s.accountName}</td>
                    <td style={styles.tableCell}>₱{s.balance.toLocaleString()}</td>
                    <td style={styles.tableCell}>{s.interest}</td>
                    <td style={styles.tableCell}>{s.lastDeposit}</td>
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                      <button onClick={() => editSavings(s)} style={styles.actionButton}>
                        Edit
                      </button>
                      <button onClick={() => archiveSavings(s.id)} style={styles.actionButton}>
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      case 'Announcements':
        return (
          <section>
            <h2>Announcements</h2>
            <div style={styles.card}>
              <h3>Maintenance Schedule</h3>
              <p>
                <strong>Last Maintenance:</strong> {state.maintenance.lastMaintenance}
              </p>
              <p>
                <strong>Next Maintenance:</strong> {state.maintenance.nextMaintenance}
              </p>
              <button onClick={() => setShowMaintenanceModal(true)} style={styles.actionButton}>
                Edit Schedule
              </button>
            </div>
            <div style={styles.toolbar}>
              <button
                onClick={() => {
                  setCurrentAnnouncement(null);
                  setShowAnnouncementModal(true);
                }}
                style={styles.primaryButton}
              >
                Add Announcement
              </button>
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                style={styles.dropdown}
              >
                <option value="">All</option>
              </select>
            </div>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableCell}>ID</th>
                  <th style={styles.tableCell}>Title</th>
                  <th style={styles.tableCell}>Content</th>
                  <th style={{ ...styles.tableCell, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.announcements.map((ann) => (
                  <tr key={ann.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{ann.id}</td>
                    <td style={styles.tableCell}>{ann.title}</td>
                    <td style={styles.tableCell}>{ann.content}</td>
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                      <button onClick={() => editAnnouncement(ann)} style={styles.actionButton}>
                        Edit
                      </button>
                      <button onClick={() => archiveAnnouncement(ann.id)} style={styles.actionButton}>
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      case 'Archive':
        return (
          <section>
            <h2>Archive</h2>
            <p>Below are the archived items with complete data from across the system:</p>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableCell}>ID</th>
                  <th style={styles.tableCell}>Type</th>
                  <th style={styles.tableCell}>Title/Name</th>
                  <th style={styles.tableCell}>Content/Description</th>
                  <th style={{ ...styles.tableCell, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.archivedItems.map((item) => (
                  <tr key={item.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{item.id}</td>
                    <td style={styles.tableCell}>{item.type}</td>
                    <td style={styles.tableCell}>
                      {item.type === 'Announcement' ? item.title : item.accountName || item.name}
                    </td>
                    <td style={styles.tableCell}>
                      {item.type === 'Announcement' ? item.content : item.description}
                    </td>
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                      <button onClick={() => restoreArchived(item)} style={styles.actionButton}>
                        Restore
                      </button>
                      <button
                        onClick={() => deleteArchived(item)}
                        style={{ ...styles.actionButton, backgroundColor: 'red' }}
                      >
                        Delete Permanently
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Tab Navigation */}
      <nav style={styles.tabNav}>
        {['Dashboard', 'Savings Overview', 'Announcements', 'Archive'].map((tab) => (
          <div
            key={tab}
            style={{
              ...styles.tabItem,
              borderBottom: activeTab === tab ? '3px solid #007BFF' : 'none',
              color: activeTab === tab ? '#007BFF' : '#000',
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </nav>
      <main style={styles.mainContent}>{renderContent()}</main>
      {showSavingsModal && (
        <SavingsAccountModal
          onClose={() => setShowSavingsModal(false)}
          onSave={addOrEditSavings}
          initialData={currentSavings}
        />
      )}
      {showAnnouncementModal && (
        <AnnouncementModal
          onClose={() => setShowAnnouncementModal(false)}
          onSave={addOrEditAnnouncement}
          initialData={currentAnnouncement}
        />
      )}
      {showMaintenanceModal && (
        <MaintenanceScheduleModal
          onClose={() => setShowMaintenanceModal(false)}
          onSave={editMaintenance}
          initialData={state.maintenance}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    margin: '0 auto',
    maxWidth: '1200px',
    padding: '20px',
  },
  tabNav: {
    display: 'flex',
    justifyContent: 'space-around',
    borderBottom: '1px solid #ccc',
    marginBottom: '20px',
  },
  tabItem: {
    padding: '10px 20px',
    cursor: 'pointer',
  },
  mainContent: {
    padding: '20px',
    backgroundColor: '#fdfdfd',
    border: '1px solid #eee',
    borderRadius: '5px',
  },
  toolbar: {
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
  },
  primaryButton: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
  },
  secondaryButton: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    marginLeft: '10px',
  },
  dropdown: {
    marginLeft: '20px',
    padding: '5px',
    borderRadius: '3px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#eee',
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
  },
  actionButton: {
    marginRight: '10px',
    cursor: 'pointer',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: '#28a745',
    color: '#fff',
  },
  card: {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    background: '#fff',
    padding: '20px',
    borderRadius: '5px',
    width: '300px',
  },
  formGroup: {
    marginBottom: '10px',
  },
  inputField: {
    width: '100%',
    padding: '5px',
    borderRadius: '3px',
    border: '1px solid #ccc',
  },
};

export default SavingsModule;
