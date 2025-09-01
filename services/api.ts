import { User, UserRole, Bill, ProblemReport, Tariff, ReportStatus } from '../types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where, orderBy, addDoc, deleteField } from 'firebase/firestore';
// Firebase Auth is not used in this app; authentication is simulated via Firestore users

// --- AUTH FUNCTIONS ---
export const login = async (email: string, password: string): Promise<User | null> => {
  console.log('Login attempt for email:', email);
  
  try {
    console.log('Trying Firestore...');
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() } as User;
      if (userData.password === password) {
        console.log('User found in Firestore:', userData);
        return userData;
      } else {
        console.log('Password incorrect for user in Firestore');
        return null;
      }
    }
    
    console.log('User not found in Firestore');
    return null;
  } catch (error) {
    console.error('Firestore error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    const updated = await getDoc(userRef);
    const updatedUser = { id: updated.id, ...updated.data() } as User;
    console.log('Profile updated in Firestore:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
  const updated = await getDoc(userRef);
  return { id: updated.id, ...updated.data() } as User;
};

export const resetUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { password: newPassword });
    console.log('Password reset in Firestore for user:', userId);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const addUser = async (userData: Omit<User, 'id' | 'customerNumber' | 'avatarUrl'>): Promise<User> => {
  try {
    // Generate customer number
    const customerNumber = `CUST${String(Date.now()).slice(-6)}`;
    
    // Generate avatar URL
    const avatarUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=150&h=150&fit=crop&crop=face`;
    
    const newUser: Omit<User, 'id'> = {
      ...userData,
      customerNumber,
      avatarUrl
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'users'), newUser);
    const createdUser = { id: docRef.id, ...newUser };
    console.log('User added to Firestore:', createdUser);
    return createdUser;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};


// User Data
export const getUserBills = async (userId: string): Promise<Bill[]> => {
  try {
    // First get all bills for the user, then sort in JavaScript to avoid index requirement
    const q = query(collection(db, 'bills'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const bills = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Bill);
    
    // Sort by dueDate in descending order in JavaScript
    const sortedBills = bills.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    
    console.log('Bills fetched from Firestore:', sortedBills);
    return sortedBills;
  } catch (error) {
    console.error('Error fetching user bills:', error);
    throw error;
  }
};

export const payBill = async (billId: string): Promise<Bill> => {
  const billRef = doc(db, 'bills', billId);
  await updateDoc(billRef, { status: 'paid', paidDate: new Date().toISOString() });
  const updated = await getDoc(billRef);
  return { id: updated.id, ...updated.data() } as Bill;
};

// --- PROBLEM REPORT API FIRESTORE ---

export const getAllProblemReports = async (): Promise<ProblemReport[]> => {
  const querySnapshot = await getDocs(collection(db, 'problemReports'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProblemReport)).sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
};

export const getUserReports = async (userId: string): Promise<ProblemReport[]> => {
  try {
    // First get all reports for the user, then sort in JavaScript to avoid index requirement
    const q = query(
      collection(db, 'problemReports'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ProblemReport);
    
    // Sort by reportedAt in descending order in JavaScript
    const sortedReports = reports.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
    
    console.log('Reports fetched from Firestore:', sortedReports);
    return sortedReports;
  } catch (error) {
    console.error('Error fetching user reports:', error);
    throw error;
  }
};

export const getAssignedReports = async (fieldOfficerId: string): Promise<ProblemReport[]> => {
  try {
    // First get all reports assigned to the field officer, then sort in JavaScript to avoid index requirement
    const q = query(collection(db, 'problemReports'), where('assigneeId', '==', fieldOfficerId));
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ProblemReport);
    
    // Sort by reportedAt in descending order in JavaScript
    const sortedReports = reports.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
    
    console.log('Assigned reports fetched from Firestore:', sortedReports);
    return sortedReports;
  } catch (error) {
    console.error('Error fetching assigned reports:', error);
    throw error;
  }
};

export const submitProblemReport = async (reportData: Omit<ProblemReport, 'id' | 'status' | 'reportedAt' | 'assigneeId'>): Promise<ProblemReport> => {
  try {
    console.log('submitProblemReport called with data:', reportData);
    console.log('Data types:', {
      userId: typeof reportData.userId,
      title: typeof reportData.title,
      description: typeof reportData.description,
      location: typeof reportData.location,
      photoUrl: typeof reportData.photoUrl
    });
    
    // Check if reportData has any unexpected fields
    console.log('All fields in reportData:', Object.keys(reportData));
    console.log('reportData.assigneeId:', (reportData as any).assigneeId);
    console.log('Full reportData object:', JSON.stringify(reportData, null, 2));
    
    // Validate that assigneeId is not present in input data
    if ('assigneeId' in reportData) {
      console.error('ERROR: assigneeId should not be present in user-submitted data!');
      console.error('reportData.assigneeId value:', (reportData as any).assigneeId);
      throw new Error('assigneeId field is not allowed in user-submitted reports');
    }
    
    // Explicitly create newReport without assigneeId to avoid any undefined values
    const newReport = {
      userId: reportData.userId,
      title: reportData.title,
      description: reportData.description,
      location: reportData.location,
      photoUrl: reportData.photoUrl,
      status: ReportStatus.BARU,
      reportedAt: new Date().toISOString()
    } as const;

    // Create clean report with only allowed fields and filter out undefined values
    const cleanReport: any = {};
    
    // Add fields only if they are not undefined
    if (newReport.userId !== undefined) cleanReport.userId = newReport.userId;
    if (newReport.title !== undefined) cleanReport.title = newReport.title;
    if (newReport.description !== undefined) cleanReport.description = newReport.description;
    if (newReport.location !== undefined) cleanReport.location = newReport.location;
    if (newReport.photoUrl !== undefined) cleanReport.photoUrl = newReport.photoUrl;
    if (newReport.status !== undefined) cleanReport.status = newReport.status;
    if (newReport.reportedAt !== undefined) cleanReport.reportedAt = newReport.reportedAt;
    
    console.log('Attempting to add document to Firestore with data:', newReport);
    console.log('newReport.assigneeId:', (newReport as any).assigneeId);
    console.log('newReport.photoUrl:', newReport.photoUrl, 'type:', typeof newReport.photoUrl);
    console.log('All fields in newReport:', Object.keys(newReport));
    console.log('Clean report (no undefined values):', cleanReport);
    console.log('Clean report fields:', Object.keys(cleanReport));
    console.log('Clean report has assigneeId?', 'assigneeId' in cleanReport);
    console.log('Clean report photoUrl:', cleanReport.photoUrl, 'type:', typeof cleanReport.photoUrl);
    
    // Final validation - ensure no assigneeId field
    if ('assigneeId' in cleanReport) {
      console.error('CRITICAL ERROR: cleanReport still contains assigneeId field!');
      throw new Error('cleanReport contains assigneeId field - this should never happen');
    }
    console.log('Firestore db instance:', db);
    console.log('Collection name: problemReports');
    
    // Test if we can access the collection
    try {
      const testQuery = await getDocs(collection(db, 'problemReports'));
      console.log('Collection access test successful, document count:', testQuery.size);
    } catch (collectionError) {
      console.error('Collection access test failed:', collectionError);
      throw new Error(`Cannot access problemReports collection: ${collectionError instanceof Error ? collectionError.message : 'Unknown error'}`);
    }
    
    const docRef = await addDoc(collection(db, 'problemReports'), cleanReport);
    const createdReport = { id: docRef.id, ...cleanReport };
    console.log('Problem report submitted to Firestore successfully:', createdReport);
    return createdReport;
  } catch (error) {
    console.error('Error submitting problem report:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to submit problem report: ${error.message}`);
    } else {
      throw new Error('Failed to submit problem report: Unknown error occurred');
    }
  }
};

export const updateProblemReport = async (reportId: string, data: Partial<ProblemReport>): Promise<ProblemReport> => {
  const reportRef = doc(db, 'problemReports', reportId);
  
  // Handle assigneeId field properly - if it's undefined, remove it from the document
  const updateData: any = { ...data };
  if ('assigneeId' in updateData && updateData.assigneeId === undefined) {
    updateData.assigneeId = deleteField();
  }
  
  await updateDoc(reportRef, updateData);
  const updated = await getDoc(reportRef);
  return { id: updated.id, ...updated.data() } as ProblemReport;
};


// Admin Data
export const getAllBills = async (): Promise<Bill[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'bills'), orderBy('dueDate', 'desc')));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bill));
};

// --- TARIFF API FIRESTORE ---

export const getAllTariffs = async (): Promise<Tariff[]> => {
  const querySnapshot = await getDocs(collection(db, 'tariffs'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tariff));
};

export const updateTariff = async (tariffId: string, data: Partial<Tariff>): Promise<Tariff> => {
  const tariffRef = doc(db, 'tariffs', tariffId);
  await updateDoc(tariffRef, data);
  const updated = await getDoc(tariffRef);
  return { id: updated.id, ...updated.data() } as Tariff;
};

export const addMeterReading = async (userId: string, reading: number): Promise<Bill> => {
  // Ambil bill terakhir user
  const q = query(collection(db, 'bills'), where('userId', '==', userId), orderBy('dueDate', 'desc'));
  const querySnapshot = await getDocs(q);
  const lastBill = querySnapshot.docs[0]?.data() as Bill | undefined;
  const lastReading = lastBill ? lastBill.currentReading : 0;
  const usage = reading - lastReading;
  // Ambil tarif standar
  const tariffSnap = await getDocs(collection(db, 'tariffs'));
  const tariff = tariffSnap.docs[0]?.data() as Tariff;
  const totalAmount = (usage * tariff.ratePerM3) + tariff.adminFee;
  const newMonth = new Date();
  const period = newMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1);
  dueDate.setDate(20);
  const newBill: Bill = {
    id: `bill-${Date.now()}`,
    userId,
    period,
    lastReading,
    currentReading: reading,
    usage,
    ratePerM3: tariff.ratePerM3,
    adminFee: tariff.adminFee,
    totalAmount,
    status: 'unpaid',
    dueDate: dueDate.toISOString(),
  };
  await setDoc(doc(db, 'bills', newBill.id), newBill);
  return newBill;
};

export const logout = () => {
  console.log("User logged out");
};

// --- USER API FIRESTORE ---
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User);
    console.log('Users fetched from Firestore:', users);
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const user = { id: snap.id, ...snap.data() } as User;
    return user;
  } catch (error) {
    console.error('Error fetching user by id:', error);
    throw error;
  }
};

// --- FIREBASE AUTH ---
export const signOut = async () => {
  console.log('User signed out successfully');
};