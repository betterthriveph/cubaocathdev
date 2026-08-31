import React, { useState } from 'react';
import { AdminUser, UserRole } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Plus, 
  Mail, 
  Phone, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Lock, 
  Key, 
  Sparkles,
  Newspaper,
  Building2,
  FileCheck,
  Heart,
  Flame,
  CalendarDays,
  DollarSign
} from 'lucide-react';

interface AdminUserSettingsProps {
  users: AdminUser[];
  currentUserId: string;
  onSelectUser: (user: AdminUser) => void;
  onUpdateUsers: (users: AdminUser[]) => void;
  showToast: (msg: string) => void;
}

export const AdminUserSettings: React.FC<AdminUserSettingsProps> = ({
  users,
  currentUserId,
  onSelectUser,
  onUpdateUsers,
  showToast
}) => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('contributor');
  const [newUserPhone, setNewUserPhone] = useState('+63 920 950 4222');

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    onUpdateUsers(updated);
    
    // If updating currently logged in user, refresh active session
    if (userId === currentUserId) {
      const updatedCurr = updated.find(u => u.id === userId);
      if (updatedCurr) onSelectUser(updatedCurr);
    }
    
    showToast(`Role updated to ${newRole.toUpperCase()} for user.`);
  };

  const handleToggleStatus = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus: 'Active' | 'Inactive' = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    onUpdateUsers(updated);
    showToast('User status updated.');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Please fill in user name and email.');
      return;
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      title: newUserTitle || (newUserRole === 'admin' ? 'Parish Administrator' : 'Media Contributor'),
      role: newUserRole,
      status: 'Active',
      lastActive: 'Never',
      createdDate: new Date().toISOString().split('T')[0],
      phone: newUserPhone
    };

    const updated = [...users, newUser];
    onUpdateUsers(updated);
    showToast(`New user "${newUser.name}" added as ${newUser.role.toUpperCase()}!`);
    setIsAddUserModalOpen(false);

    // Reset
    setNewUserName('');
    setNewUserEmail('');
    setNewUserTitle('');
    setNewUserRole('contributor');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-[#0171bb] rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-400/30">
              Access Control & RBAC
            </span>
            <span className="text-xs text-blue-200">2 User Roles (Admin & Contributor)</span>
          </div>
          <h2 className="font-cathedral text-2xl sm:text-3xl font-bold tracking-tight">
            User Settings & Role Permissions
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            Manage Cathedral secretariat staff and volunteer access. Admins have full access across all church operations; Contributors have dedicated access exclusively to the Blog & Parish News CMS.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* ACTIVE PROFILE SWITCHER / SIMULATOR BANNER */}
      <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4.5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-950">Active Session Persona:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  currentUser.role === 'admin' ? 'bg-[#0171bb] text-white' : 'bg-purple-600 text-white'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-0.5">
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.title})
              </p>
            </div>
          </div>

          {/* Quick profile switch selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-900">Switch Persona:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const selected = users.find(u => u.id === e.target.value);
                if (selected) {
                  onSelectUser(selected);
                  showToast(`Switched active profile to ${selected.name} (${selected.role.toUpperCase()})`);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} — [{u.role.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-amber-800/90 leading-relaxed border-t border-amber-200 pt-2">
          💡 <strong>Testing Instructions:</strong> Switch persona to <strong>Bro. John Paul Ramirez (Contributor)</strong> to observe how all facility bookings, finances, sacraments, certificates, and user settings are restricted, and only the Blog & News CMS remains accessible.
        </p>
      </div>

      {/* Role Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Admin Role Card */}
        <div className="bg-white rounded-2xl border-2 border-[#0171bb]/30 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0171bb] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cathedral text-base font-bold text-slate-900">Admin Role</h3>
                <span className="text-[10px] text-slate-500">Unrestricted Parish Operations</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0171bb] text-xs font-bold">
              Full Access
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Reserved for Cathedral Priests, Chancery staff, and Parish Office Administrators.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              <span>Facility Reservations & Rental Pricing</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              <span>Baptismal, Confirmation & Wedding Certificates</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              <span>Sacraments Registry & Canonical Clearance</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              <span>Mass Intentions & Financial Audit</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              <span>News & Parish Announcements CMS</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 shrink-0" />
              <span>User Permissions & Access Control</span>
            </div>
          </div>
        </div>

        {/* Contributor Role Card */}
        <div className="bg-white rounded-2xl border-2 border-purple-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cathedral text-base font-bold text-slate-900">Contributor Role</h3>
                <span className="text-[10px] text-slate-500">Parish Communications & Media</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
              CMS Access Only
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Assigned to Youth writers, Liturgical Communications Ministry, and bulletin contributors.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              <span>Create, Draft, Edit, Publish Parish Blog & News</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 line-through">
              <X className="w-4 h-4 shrink-0 text-slate-300" />
              <span>Facility Reservations & Rental Pricing (Restricted)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 line-through">
              <X className="w-4 h-4 shrink-0 text-slate-300" />
              <span>Sacramental Certificates & Records (Restricted)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 line-through">
              <X className="w-4 h-4 shrink-0 text-slate-300" />
              <span>Financial Reports & Mass Intentions (Restricted)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 line-through">
              <X className="w-4 h-4 shrink-0 text-slate-300" />
              <span>User Management & System Settings (Restricted)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="font-cathedral text-base font-bold text-slate-900">Cathedral Staff & Users Directory</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{users.length} Registered Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3.5">User / Designation</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">Role Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Name & Title */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.id === currentUserId && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{user.title}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-3.5 space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </td>

                  {/* Role */}
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      user.role === 'admin'
                        ? 'bg-[#0171bb]/10 text-[#0171bb] border border-[#0171bb]/20'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.role === 'admin' ? 'bg-[#0171bb]' : 'bg-purple-600'
                      }`} />
                      {user.role === 'admin' ? 'Admin (Full)' : 'Contributor (CMS)'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        user.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>

                  {/* Last Active */}
                  <td className="p-3.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{user.lastActive}</span>
                    </div>
                  </td>

                  {/* Role Switcher Action */}
                  <td className="p-3.5 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:border-[#0171bb] cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="contributor">Contributor</option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD NEW USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0171bb]" />
                <h3 className="font-cathedral text-lg font-bold text-slate-900">Add Staff / Contributor</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Bro. Mark Rivera"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="mark.rivera@cubadiocese.ph"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Job Title / Ministry</label>
                  <input
                    type="text"
                    value={newUserTitle}
                    onChange={(e) => setNewUserTitle(e.target.value)}
                    placeholder="e.g. Youth Writer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0171bb]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Assign Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:border-[#0171bb]"
                  >
                    <option value="contributor">Contributor (CMS Only)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Contact Number</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+63 920 950 4222"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold"
                >
                  Add User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
