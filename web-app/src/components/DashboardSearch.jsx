import React, { useState, useEffect, useRef } from "react";
import { DashboardService, PatientService, AppointmentService } from "../services";

const DashboardSearch = ({ onResultSelect, placeholder = "Search patients, appointments..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ patients: [], appointments: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setResults({ patients: [], appointments: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Handle clicks outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query) => {
    try {
      setIsLoading(true);
      const searchResults = await DashboardService.searchDashboard(query, 8);
      setResults(searchResults);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ patients: [], appointments: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    const allResults = [...results.patients, ...results.appointments];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < allResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : allResults.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allResults[selectedIndex]) {
        handleResultSelect(allResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  const handleResultSelect = (result) => {
    setShowResults(false);
    setSearchQuery('');
    setSelectedIndex(-1);
    onResultSelect && onResultSelect(result);
  };

  const allResults = [...results.patients, ...results.appointments];
  const totalResults = allResults.length;

  return (
    <div ref={searchRef} style={searchContainerStyles}>
      <div style={searchInputContainerStyles}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          style={searchInputStyles}
        />
        <div style={searchIconStyles}>
          {isLoading ? (
            <div style={loadingSpinnerStyles}>⌛</div>
          ) : (
            <span>🔍</span>
          )}
        </div>
      </div>

      {showResults && totalResults > 0 && (
        <div ref={resultsRef} style={resultsContainerStyles}>
          <div style={resultsSectionStyles}>
            {results.patients.length > 0 && (
              <>
                <div style={sectionHeaderStyles}>
                  <span style={sectionIconStyles}>👥</span>
                  Patients ({results.patients.length})
                </div>
                {results.patients.map((patient, index) => (
                  <div
                    key={`patient-${patient._id}`}
                    style={{
                      ...resultItemStyles,
                      ...(selectedIndex === index ? selectedResultStyles : {})
                    }}
                    onClick={() => handleResultSelect(patient)}
                  >
                    <div style={resultMainStyles}>
                      <span style={resultNameStyles}>{patient.displayName}</span>
                      <span style={resultInfoStyles}>{patient.displayInfo}</span>
                    </div>
                    <div style={resultTypeStyles}>Patient</div>
                  </div>
                ))}
              </>
            )}

            {results.appointments.length > 0 && (
              <>
                <div style={sectionHeaderStyles}>
                  <span style={sectionIconStyles}>📅</span>
                  Appointments ({results.appointments.length})
                </div>
                {results.appointments.map((appointment, index) => (
                  <div
                    key={`appointment-${appointment._id}`}
                    style={{
                      ...resultItemStyles,
                      ...(selectedIndex === (results.patients.length + index) ? selectedResultStyles : {})
                    }}
                    onClick={() => handleResultSelect(appointment)}
                  >
                    <div style={resultMainStyles}>
                      <span style={resultNameStyles}>{appointment.displayName}</span>
                      <span style={resultInfoStyles}>{appointment.displayInfo}</span>
                    </div>
                    <div style={resultTypeStyles}>Appointment</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {showResults && totalResults === 0 && searchQuery.trim().length >= 2 && !isLoading && (
        <div style={resultsContainerStyles}>
          <div style={noResultsStyles}>
            <span style={noResultsIconStyles}>🔍</span>
            <span>No results found for "{searchQuery}"</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const searchContainerStyles = {
  position: 'relative',
  width: '100%',
  maxWidth: '400px'
};

const searchInputContainerStyles = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const searchInputStyles = {
  width: '100%',
  padding: '12px 45px 12px 16px',
  border: '2px solid var(--medical-gray-200)',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  backgroundColor: 'var(--medical-gray-50)',
  transition: 'all var(--transition-base)',
  outline: 'none',
  fontFamily: 'inherit'
};

const searchIconStyles = {
  position: 'absolute',
  right: '12px',
  fontSize: '16px',
  color: 'var(--medical-gray-500)',
  pointerEvents: 'none'
};

const loadingSpinnerStyles = {
  animation: 'spin 1s linear infinite'
};

const resultsContainerStyles = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: 'white',
  border: '1px solid var(--medical-gray-200)',
  borderRadius: 'var(--radius-md)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  maxHeight: '400px',
  overflowY: 'auto',
  marginTop: '4px'
};

const resultsSectionStyles = {
  padding: '8px 0'
};

const sectionHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--medical-gray-600)',
  backgroundColor: 'var(--medical-gray-50)',
  borderBottom: '1px solid var(--medical-gray-100)'
};

const sectionIconStyles = {
  marginRight: '8px',
  fontSize: '14px'
};

const resultItemStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  cursor: 'pointer',
  transition: 'all var(--transition-base)',
  borderBottom: '1px solid var(--medical-gray-100)'
};

const selectedResultStyles = {
  backgroundColor: 'var(--medical-blue-50)',
  borderColor: 'var(--medical-blue-200)'
};

const resultMainStyles = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const resultNameStyles = {
  fontSize: '14px',
  fontWeight: '500',
  color: 'var(--medical-gray-800)'
};

const resultInfoStyles = {
  fontSize: '12px',
  color: 'var(--medical-gray-600)'
};

const resultTypeStyles = {
  fontSize: '11px',
  fontWeight: '500',
  color: 'var(--medical-blue-600)',
  backgroundColor: 'var(--medical-blue-50)',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const noResultsStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 16px',
  color: 'var(--medical-gray-500)',
  fontSize: '14px',
  gap: '8px'
};

const noResultsIconStyles = {
  fontSize: '18px',
  opacity: 0.6
};

export default DashboardSearch;