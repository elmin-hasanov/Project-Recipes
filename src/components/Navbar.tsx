// Navbar.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supabaseClient } from '../lib/supabaseClient';
import styles from './Navbar.module.css';

import iconuser from '../assets/icons/user.svg';
import iconusersettings from '../assets/icons/userlog.svg';
import x from '../assets/icons/x.svg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.navbarHeader}>
        <button
          className={styles.menuButton}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <AnimatePresence mode="wait">
            {hovered ? (
              <motion.svg
                key="pan"
                viewBox="0 0 100 100"
                width="48"
                height="48"
                initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                fill="#ffe7d7"
              >
                <circle
                  cx="40"
                  cy="50"
                  r="20"
                  stroke="#ffe7d7"
                  strokeWidth="4"
                  fill="none"
                />
                <rect x="60" y="48" width="30" height="6" rx="3" />
                <circle cx="38" cy="42" r="2" />
                <circle cx="42" cy="58" r="2" />
              </motion.svg>
            ) : (
              <motion.svg
                key="burger"
                viewBox="0 0 100 100"
                width="48"
                height="48"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                fill="#ffe7d7"
              >
                <rect x="20" y="28" rx="10" ry="10" width="60" height="8" />
                <rect x="20" y="46" rx="6" ry="6" width="60" height="6" />
                <rect x="20" y="64" rx="10" ry="10" width="60" height="8" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        <Link to="/" className={styles.logo}>
          Chef’s Kitchen
        </Link>

        <div className={styles.userIcon}>
          {loading ? (
            <img src={iconuser} alt="Lade..." />
          ) : user ? (
            <Link to="/profil">
              <img
                className={styles.userIcon}
                src={iconusersettings}
                alt="Profil"
              />
            </Link>
          ) : (
            <Link to="/login">
              <img className={styles.userIcon} src={iconuser} alt="Login" />
            </Link>
          )}
        </div>
      </div>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}></div>
      )}

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
          <img src={x} className={styles.closeIcon} alt="Schließen" />
        </button>

        <NavLink
          className={({ isActive }) =>
            isActive ? styles.active : styles.normal
          }
          to="/"
          onClick={() => setIsOpen(false)}
        >
          Home
        </NavLink>
        <NavLink
          to="/rezepte"
          className={({ isActive }) =>
            isActive ? styles.active : styles.normal
          }
          onClick={() => setIsOpen(false)}
        >
          Rezepte
        </NavLink>
        <NavLink
          to="/über-uns"
          className={({ isActive }) =>
            isActive ? styles.active : styles.normal
          }
          onClick={() => setIsOpen(false)}
        >
          Über uns
        </NavLink>

        {!loading && !user && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? styles.active : styles.normal
            }
            onClick={() => setIsOpen(false)}
          >
            Login
          </NavLink>
        )}

        {!loading && user && (
          <>
            <NavLink
              to="/neues-rezept"
              className={({ isActive }) =>
                isActive ? styles.active : styles.normal
              }
              onClick={() => setIsOpen(false)}
            >
              Neues Rezept
            </NavLink>
            <NavLink
              to="/profil"
              className={({ isActive }) =>
                isActive ? styles.active : styles.normal
              }
              onClick={() => setIsOpen(false)}
            >
              Profil
            </NavLink>
            <button onClick={handleLogout} className={styles.logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
