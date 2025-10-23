import React, { useState, useRef, useEffect } from "react";
import "./SearchableDropdown.css";
import { Capitalize } from "../../../utils/StringFunctions";

const SearchableDropdown = ({
  label,
  placeholder,
  items,
  value,
  onSelect,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterText, setFilterText] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleSelect = (item) => {
    onSelect(item);
    setShowDropdown(false);
    setFilterText("");
  };

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      {label && <label>{label}</label>}
      <div
        className="dropdown-display"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        {value ? Capitalize(value) : placeholder}
        <span className="dropdown-arrow">▾</span>
      </div>

      {showDropdown && (
        <div className="dropdown-container">
          <input
            type="text"
            className="dropdown-search"
            placeholder="Type to filter..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            autoFocus
          />
          <ul className="dropdown-options">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <li key={item} onClick={() => handleSelect(item)}>
                  {Capitalize(item)}
                </li>
              ))
            ) : (
              <li className="no-match">No matches found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
