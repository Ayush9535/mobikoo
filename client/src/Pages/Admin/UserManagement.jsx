
import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import Signup from '../AuthPages/Signup';

const UserManagement = () => {

  const [tab, setTab] = useState('shopowners');
  const [shopOwners, setShopOwners] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === 'shopowners') {
      fetch('/api/admin/shopowners')
        .then(res => res.json())
        .then(data => setShopOwners(data))
        .finally(() => setLoading(false));
    } else {
      fetch('/api/admin/managers')
        .then(res => res.json())
        .then(data => setManagers(data))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  return (
    <div className="user-management-section">
      <div className="dashboard-header" style={{marginBottom:'1.2rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span>Users Management</span>
        <button className="create-user-btn" onClick={()=>setShowSignup(true)}>Create User</button>
      </div>
      <div style={{display:'flex',gap:'1rem',marginBottom:'1rem'}}>
        <button className={tab==='shopowners'?"user-tab-active":"user-tab-btn"} onClick={()=>setTab('shopowners')}>Shop Owners</button>
        <button className={tab==='managers'?"user-tab-active":"user-tab-btn"} onClick={()=>setTab('managers')}>Managers</button>
      </div>
      {showSignup && (
        <div className="signup-modal-bg" onClick={()=>setShowSignup(false)}>
          <div className="signup-modal" onClick={e=>e.stopPropagation()}>
            <Signup />
            <button className="close-modal-btn" onClick={()=>setShowSignup(false)}>Close</button>
          </div>
        </div>
      )}
      {loading ? <div>Loading...</div> : (
        <div className="user-table-wrapper">
          {tab === 'shopowners' && (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Shop Owner Id</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Shop Name</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {shopOwners.map((owner, idx) => (
                  <tr key={owner.shop_code || idx}>
                    <td>{owner.shop_code}</td>
                    <td>{owner.shop_name}</td>
                    <td>{owner.email}</td>
                    <td>{owner.contact_number}</td>
                    <td>{owner.shop_name}</td>
                    <td>{owner.shop_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'managers' && (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Manager Id</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager, idx) => (
                  <tr key={manager.manager_code || idx}>
                    <td>{manager.manager_code}</td>
                    <td>{manager.manager_name}</td>
                    <td>{manager.email}</td>
                    <td>{manager.contact_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(UserManagement);
