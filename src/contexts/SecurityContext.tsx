import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { lockVault } from '../utils/db';
import { useNavigate, useLocation } from 'react-router-dom';
import TicTacToe from '../components/TicTacToe';

interface SecurityContextType {
  isPanicLocked: boolean;
  triggerPanicLock: () => void;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurity = () => {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within a SecurityProvider');
  return ctx;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPanicLocked, setIsPanicLocked] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const escPresses = useRef(0);
  const escTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const INACTIVITY_LIMIT_MS = 10000; // 10 seconds of inactivity triggers blur

  const triggerPanicLock = () => {
    setIsPanicLocked(true);
    lockVault(); // immediately destroy the session keys in memory
    navigate('/auth'); // Route away in the background
  };

  const resetInactivity = () => {
    if (isBlurred) setIsBlurred(false);
    
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    
    if (!isPanicLocked && location.pathname !== '/auth') {
      // Blur after 30 seconds
      inactivityTimer.current = setTimeout(() => {
        setIsBlurred(true);
      }, 30000);

      // Auto-lock after 5 minutes if enabled in settings
      const autoLockEnabled = localStorage.getItem('ghostdiary_autolock') !== 'false';
      if (autoLockEnabled) {
        autoLockTimer.current = setTimeout(() => {
          lockVault();
          navigate('/auth');
        }, 5 * 60 * 1000);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetInactivity();
      
      if (e.key === 'Escape') {
        escPresses.current += 1;
        
        if (escTimer.current) clearTimeout(escTimer.current);
        
        if (escPresses.current >= 3) {
          triggerPanicLock();
        } else {
          escTimer.current = setTimeout(() => {
            escPresses.current = 0;
          }, 1000); // Need to press Esc 3 times within 1 second
        }
      }
    };

    const handleWindowBlur = () => {
      // Auto blur content when window loses focus
      if (location.pathname !== '/auth') {
        setIsBlurred(true);
      }
    };

    const handleWindowFocus = () => {
      resetInactivity();
    };

    const handleMouseMove = () => resetInactivity();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseMove);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    resetInactivity();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseMove);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
      if (escTimer.current) clearTimeout(escTimer.current);
    };
  }, [location.pathname, isPanicLocked, isBlurred]);

  return (
    <SecurityContext.Provider value={{ isPanicLocked, triggerPanicLock }}>
      
      {/* Auto Blur Overlay */}
      {isBlurred && !isPanicLocked && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backdropFilter: 'blur(15px)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1.2rem', fontFamily: 'monospace'
        }}>
          Paused for security. Move mouse or click to resume.
        </div>
      )}

      {/* Functional Tic-Tac-Toe for Panic Lock */}
      {isPanicLocked ? (
        <TicTacToe />
      ) : (
        children
      )}
    </SecurityContext.Provider>
  );
};
