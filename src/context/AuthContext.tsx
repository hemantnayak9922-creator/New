import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  balance: number;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, balance: 0 });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      setLoading(false);
      
      if (usr) {
        // Setup listener for user's wallet
        const userRef = doc(db, 'users', usr.uid);
        
        try {
          // Ensure document exists
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            await setDoc(userRef, { balance: 150 }); // Give random initial balance of ₹150
          }
        } catch (error) {
          console.warn("Failed to get/set user balance document:", error);
          // Fallback if offline
        }
        
        unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setBalance(doc.data().balance || 0);
          } else {
            setBalance(150); // Fallback if document doesn't exist and couldn't be created
          }
        }, (error) => {
          console.error("Firestore snapshot error:", error);
        });
      } else {
        setBalance(0);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, balance }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
