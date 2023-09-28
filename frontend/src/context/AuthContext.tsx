import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "@firebase/auth";
import React, { useContext, useEffect, useMemo, useState } from "react";
import database from "./FirebaseConfig";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<UserCredential | void>;
  signup: (email: string, password: string) => Promise<UserCredential | void>;
  logout: () => Promise<void>;
  updateThePassword: (password: string) => Promise<void | Error>;
  deleteTheUser: () => Promise<void | Error>;
}

const AuthContext = React.createContext<AuthContextType>({
  currentUser: {} as User | null,
  login: () => Promise.resolve(),
  signup: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateThePassword: () => Promise.resolve(),
  deleteTheUser: () => Promise.resolve(),
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(database, email, password);
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(database, email, password);
  }

  function logout() {
    return signOut(database);
  }

  //   function resetPassword(email) {
  //     return auth.sendPasswordResetEmail(email);
  //   }

  //   function updateTheEmail(email: string) {
  //     //   return currentUser?.updateEmail(email);
  //     if (currentUser) {
  //       return updateEmail(currentUser, email);
  //     }
  //     return Promise.resolve(new Error("Current user is not defined"));
  //   }
  function deleteTheUser() {
    if (currentUser) {
      return deleteUser(currentUser);
    }
    return Promise.resolve(new Error("Current user is not defined"));
  }

  function updateThePassword(password: string) {
    if (currentUser) {
      return updatePassword(currentUser, password);
    }
    return Promise.resolve(new Error("Current user is not defined"));
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(database, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => {
    return {
      currentUser,
      login,
      signup,
      logout,
      updateThePassword,
      deleteTheUser,
      // updatePassword,
      // resetPassword
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}