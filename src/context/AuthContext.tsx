import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Organization, SupervisorAssignment } from '../types';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserProfile | null;
  currentOrg: Organization | null;
  activeRole: UserRole;
  isSupervisorMode: boolean;
  supervisedTeacher: UserProfile | null;
  supervisedTeacherId?: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (fullName: string, email: string, pass: string, orgId?: string) => Promise<boolean>;
  registerNewUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
  setActiveRole: (role: UserRole) => void;
  setSupervisorMode: (active: boolean) => void;
  enterSupervisorMode: (teacher: UserProfile) => void;
  exitSupervisorMode: () => void;
  switchOrganization: (org: Organization) => void;
  switchAccount: (userId: string) => void;
  updateCurrentUserProfile: (data: Partial<UserProfile>) => void;
  allUsers: UserProfile[];
  allOrganizations: Organization[];
  addUserByAdmin: (user: Partial<UserProfile>) => void;
  updateUserByAdmin: (id: string, data: Partial<UserProfile>) => void;
  deleteUserByAdmin: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial organizations
const INITIAL_ORGS: Organization[] = [
  {
    id: 'org_smp_nusantara',
    name: 'SMP Negeri 1 Nusantara',
    code: 'SMPN1-NUS',
    type: 'school',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org_mts_madani',
    name: 'MTs Al-Madani',
    code: 'MTS-MDN',
    type: 'madrasah',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial seeded accounts representing all roles according to DADU specification
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_admin_primary',
    organizationId: 'org_smp_nusantara',
    email: 'admin@dadu.sch.id',
    fullName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    displayName: 'Ahmad Fauzi (Admin)',
    roles: ['admin', 'teacher'],
    status: 'active',
    isPrimaryAdmin: true,
    avatarType: 'male_formal',
    nip: '197508151999031002',
    position: 'Administrator & Guru Senior',
    phoneNumber: '081234567890',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_teacher_siti',
    organizationId: 'org_smp_nusantara',
    email: 'siti.aminah@dadu.sch.id',
    fullName: 'Siti Aminah, S.Pd., M.Si.',
    displayName: 'Ibu Siti',
    roles: ['teacher', 'homeroom_teacher'],
    status: 'active',
    avatarType: 'female_hijab',
    nip: '198803122011012004',
    nuptk: '4563766668210032',
    position: 'Guru Matematika & Wali Kelas VII-A',
    phoneNumber: '081398765432',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_teacher_budi',
    organizationId: 'org_smp_nusantara',
    email: 'budi.santoso@dadu.sch.id',
    fullName: 'Budi Santoso, S.Pd.',
    displayName: 'Pak Budi',
    roles: ['teacher'],
    status: 'active',
    avatarType: 'male_formal',
    nip: '199205042018021001',
    nuptk: '7829760662200013',
    position: 'Guru Bahasa Indonesia',
    phoneNumber: '085211223344',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_supervisor_ridwan',
    organizationId: 'org_smp_nusantara',
    email: 'pengawas.ridwan@dadu.sch.id',
    fullName: 'Dr. H. Ridwan Kamil, M.Ed.',
    displayName: 'Dr. Ridwan (Pengawas)',
    roles: ['supervisor'],
    status: 'active',
    avatarType: 'male_formal',
    nip: '196811201994031005',
    position: 'Pengawas Pembina Sekolah / Asesor',
    phoneNumber: '081199887766',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_pending_dewi',
    organizationId: 'org_smp_nusantara',
    email: 'dewi.lestari@dadu.sch.id',
    fullName: 'Dewi Lestari, S.Pd.',
    displayName: 'Dewi Lestari',
    roles: ['teacher'],
    status: 'pending',
    avatarType: 'female_hijab',
    position: 'Calon Guru IPA (Pendaftar Baru)',
    phoneNumber: '087812345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('dadu_users_db');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [allOrganizations, setAllOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('dadu_orgs_db');
    return saved ? JSON.parse(saved) : INITIAL_ORGS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedId = localStorage.getItem('dadu_current_user_id');
    if (savedId) {
      const u = allUsers.find(x => x.id === savedId);
      if (u) return u;
    }
    return null; // Production mode: Start at Login Screen if no active session
  });

  const [currentOrg, setCurrentOrg] = useState<Organization | null>(() => {
    return allOrganizations[0];
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    return currentUser?.roles[0] || 'teacher';
  });

  const [isSupervisorMode, setIsSupervisorMode] = useState<boolean>(false);
  const [supervisedTeacher, setSupervisedTeacher] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync auth state with Firebase Auth on startup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        // Find corresponding user profile in local/Firestore
        const local = allUsers.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());
        if (local) {
          setCurrentUser(local);
          setActiveRoleState(local.roles[0] || 'teacher');
        } else if (fbUser.email) {
          // New registered Firebase user profile
          const created: UserProfile = {
            id: fbUser.uid,
            organizationId: currentOrg?.id || 'org_smp_nusantara',
            email: fbUser.email,
            fullName: fbUser.displayName || fbUser.email.split('@')[0],
            displayName: fbUser.displayName?.split(' ')[0] || fbUser.email.split('@')[0],
            roles: ['teacher'],
            status: 'pending',
            avatarType: 'male_formal',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setAllUsers(prev => [created, ...prev]);
          setCurrentUser(created);
        }
      }
    });

    return () => unsubscribe();
  }, [allUsers, currentOrg]);

  useEffect(() => {
    localStorage.setItem('dadu_users_db', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('dadu_orgs_db', JSON.stringify(allOrganizations));
  }, [allOrganizations]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dadu_current_user_id', currentUser.id);
      if (!currentUser.roles.includes(activeRole)) {
        setActiveRoleState(currentUser.roles[0] || 'teacher');
      }
    } else {
      localStorage.removeItem('dadu_current_user_id');
    }
  }, [currentUser, activeRole]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Try Firebase Authentication
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (fbErr: any) {
        console.info('Firebase auth pass-through / checking local registry:', fbErr.message);
      }

      // 2. Check user profile in DADU database
      const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        if (found.status === 'disabled') {
          alert('Akun Anda telah dinonaktifkan oleh Administrator. Hubungi pihak sekolah.');
          return false;
        }
        if (found.status === 'pending') {
          alert('Pendaftaran Anda sedang menunggu persetujuan Administrator.');
          return false;
        }
        setCurrentUser(found);
        setActiveRoleState(found.roles[0]);
        setIsSupervisorMode(false);
        setSupervisedTeacher(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, pass: string, orgId?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      let uid = `usr_${Date.now()}`;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (cred.user) {
          uid = cred.user.uid;
        }
      } catch (fbErr: any) {
        console.warn('Firebase user create notice:', fbErr.message);
      }

      const isFirst = allUsers.length === 0;
      const newUser: UserProfile = {
        id: uid,
        organizationId: orgId || currentOrg?.id || 'org_smp_nusantara',
        email,
        fullName,
        displayName: fullName.split(' ')[0],
        roles: isFirst ? ['admin', 'teacher'] : ['teacher'],
        status: isFirst ? 'active' : 'pending', // First user is primary admin, subsequent require approval
        isPrimaryAdmin: isFirst,
        avatarType: 'male_formal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAllUsers(prev => [newUser, ...prev]);

      // Save user record to Firestore if online
      try {
        await setDoc(doc(db, 'users', uid), newUser);
      } catch (e) {
        console.info('Saved locally, will sync when Firestore rule permits.');
      }

      return true;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // Ignore signout errors
    }
    localStorage.removeItem('dadu_current_user_id');
    setCurrentUser(null);
    setIsSupervisorMode(false);
    setSupervisedTeacher(null);
  };

  const setActiveRole = (role: UserRole) => {
    if (currentUser?.roles.includes(role) || currentUser?.roles.includes('admin')) {
      setActiveRoleState(role);
      if (role !== 'supervisor') {
        setIsSupervisorMode(false);
        setSupervisedTeacher(null);
      }
    }
  };

  const enterSupervisorMode = (teacher: UserProfile) => {
    setIsSupervisorMode(true);
    setSupervisedTeacher(teacher);
  };

  const exitSupervisorMode = () => {
    setIsSupervisorMode(false);
    setSupervisedTeacher(null);
  };

  const switchOrganization = (org: Organization) => {
    setCurrentOrg(org);
  };

  const updateCurrentUserProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  };

  const addUserByAdmin = (user: Partial<UserProfile>) => {
    const created: UserProfile = {
      id: `usr_${Date.now()}`,
      organizationId: user.organizationId || currentOrg?.id || 'org_smp_nusantara',
      email: user.email || '',
      fullName: user.fullName || '',
      displayName: user.displayName || user.fullName,
      roles: user.roles && user.roles.length > 0 ? user.roles : ['teacher'],
      status: user.status || 'active',
      isPrimaryAdmin: false,
      avatarType: user.avatarType || 'male_formal',
      nip: user.nip,
      nuptk: user.nuptk,
      position: user.position,
      phoneNumber: user.phoneNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAllUsers(prev => [created, ...prev]);
  };

  const updateUserByAdmin = (id: string, data: Partial<UserProfile>) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...data, updatedAt: new Date().toISOString() };
        if (currentUser?.id === id) setCurrentUser(updated);
        return updated;
      }
      return u;
    }));
  };

  const deleteUserByAdmin = (id: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      logout();
    }
  };

  const switchAccount = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setActiveRoleState(target.roles[0]);
      setIsSupervisorMode(false);
      setSupervisedTeacher(null);
    }
  };

  const setSupervisorMode = (active: boolean) => {
    setIsSupervisorMode(active);
    if (!active) {
      setSupervisedTeacher(null);
    }
  };

  const registerNewUser = (user: Partial<UserProfile>) => {
    addUserByAdmin(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentOrg,
        activeRole,
        isSupervisorMode,
        supervisedTeacher,
        supervisedTeacherId: supervisedTeacher?.id || null,
        isLoading,
        login,
        register,
        registerNewUser,
        logout,
        setActiveRole,
        setSupervisorMode,
        enterSupervisorMode,
        exitSupervisorMode,
        switchOrganization,
        switchAccount,
        updateCurrentUserProfile,
        allUsers,
        allOrganizations,
        addUserByAdmin,
        updateUserByAdmin,
        deleteUserByAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
