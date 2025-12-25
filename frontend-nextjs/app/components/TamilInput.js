"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function TamilInput({ 
  value = "", 
  onChange, 
  placeholder = "Type here...", 
  className = "",
  label = "",
  id,
  isTextArea = false, // Prop to choose between input and textarea
  forcedLanguage = null,
  helperMessage = "", // New prop for helper message
  enablePasswordToggle = false, // Not enabled by default
  displayLanguage = null, // New prop to control visual styling language separate from input behavior
  children,
  ...props 
}) {
  const [internalLanguage, setInternalLanguage] = useState("en"); 
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);
  const suggestionBoxRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);



  // Determine effective language
  const language = forcedLanguage || internalLanguage;
  
  // Debug log (temporary)
  useEffect(() => {
    console.log("TamilInput: Current Language:", language, "Forced:", forcedLanguage, "Internal:", internalLanguage);
  }, [language, forcedLanguage, internalLanguage]);

  // Toggle Language
  const toggleLanguage = (lang) => {
    if (forcedLanguage) return;
    setInternalLanguage(lang);
    setSuggestions([]);
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    
    if (language === "en") {
      onChange({ target: { name: props.name, value: newVal } });
      return;
    }
    onChange({ target: { name: props.name, value: newVal } });
    let caret = 0;
    try {
      caret = e.target.selectionStart || newVal.length;
    } catch (error) {
      // Password inputs don't support selectionStart
      caret = newVal.length;
    }
    setCursorPosition(caret);
    
    const currentWord = getCurrentWord(newVal, caret);
    console.log("TamilInput: Typed word:", currentWord);
    
    // Skip API if word contains any numbers (e.g. "user123" or "2024")
    if (currentWord && /\d/.test(currentWord)) {
       setSuggestions([]);
       setShowSuggestions(false);
       return;
    }
    
    if (currentWord && currentWord.trim().length > 0) {
      fetchSuggestions(currentWord);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const getCurrentWord = (text, caretPos) => {
    const leftPart = text.slice(0, caretPos);
    // Split by space or standard separators to handle "vishnu@1972"
    const words = leftPart.split(/[\s@._-]+/);
    return words[words.length - 1];
  };

  const fetchSuggestions = async (word) => {
    try {
      if (!word) return;
      console.log("TamilInput: Fetching suggestions for", word);
      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=ta-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`;
      const res = await fetch(url);
      const data = await res.json();
      console.log("TamilInput: API Response", data);
      
      if (data && data[0] === 'SUCCESS') {
        const result = data[1][0][1];
        setSuggestions(result);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching tamil suggestions:", error);
    }
  };

  const handleDisplaySuggestion = (suggestion) => {
    if (!inputRef.current) return;
    
    const caret = inputRef.current.selectionStart;
    const text = value;
    const leftPart = text.slice(0, caret);
    const rightPart = text.slice(caret);
    
    // Find start of word using same delimiters
    // We look for the last delimiter in the leftPart
    // Delimiters: space, @, ., _, -
    const match = leftPart.match(/[\s@._-]+(?=[^@._-\s]*$)/);
    const lastDelimiterIndex = match ? match.index + match[0].length : -1;
    
    // If no delimiter found, start is 0, else index after delimiter
    const startOfWord = lastDelimiterIndex === -1 ? 0 : lastDelimiterIndex;
    
    const newText = text.slice(0, startOfWord) + suggestion + " " + rightPart;
    
    onChange({ target: { name: props.name, value: newText } });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const focusNextInput = (currentInput, direction) => {
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([disabled]), textarea:not([disabled])'));
    const currentIndex = inputs.indexOf(currentInput);
    if (currentIndex === -1) return;

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < inputs.length) {
      inputs[newIndex].focus();
    }
  };

  const handleArrowNavigation = (e) => {
    // Skip for special types on Up/Down to avoid breaking native behavior
    if (['number', 'date', 'time', 'range', 'datetime-local'].includes(props.type)) {
       if (['ArrowUp', 'ArrowDown'].includes(e.key)) return;
    }
    // Skip Up/Down for textarea to allow line navigation
    if (isTextArea && ['ArrowUp', 'ArrowDown'].includes(e.key)) return;

    const input = e.target;
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusNextInput(input, -1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusNextInput(input, 1);
    } else if (e.key === 'ArrowLeft') {
      // Only move if cursor is at the start
      if (input.selectionStart === 0 && input.selectionEnd === 0) {
        e.preventDefault();
        focusNextInput(input, -1);
      }
    } else if (e.key === 'ArrowRight') {
      // Only move if cursor is at the end
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        focusNextInput(input, 1);
      }
    }
  };

  const handleKeyDown = (e) => {
    // Handle Navigation Logic first (works in all languages)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      handleArrowNavigation(e);
    }

    if (language === "en") return;
    
    // Only prevent default if we're actually showing suggestions
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleDisplaySuggestion(suggestions[0]);
      }
    }
    // Otherwise, allow normal behavior (including form submission on Enter)
  };




  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const InputComponent = isTextArea ? 'textarea' : 'input';

  // Extract margins AND width properties from props.style to apply to the wrapper
  const { width, ...inputStyle } = props.style || {};
  const wrapperStyle = { width };

  return (
    <div style={wrapperStyle} className="relative">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      
      {!forcedLanguage && (
      <div >
        <span >Input Language:</span>
        <div >
          <button 
            type="button"
            onClick={() => toggleLanguage('en')}
            className={`px-3 py-1 rounded ${language === 'en' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            English
          </button>
          <button 
            type="button"
            onClick={() => toggleLanguage('ta')}
            className={`px-3 py-1 rounded ${language === 'ta' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Tamil
          </button>
        </div>
      </div>
      )}

      {/* Input Container - Relative for positioning eye icon relative to input ONLY */}
      <div className="relative w-full">
        <InputComponent
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          // Use passed className or minimally default if none provides. Removed border/padding forcing.
          className={`w-full ${!props.style && !className ? 'p-2 border border-gray-300 rounded' : ''} ${className}`}
          style={{
            ...inputStyle,
            paddingRight: enablePasswordToggle && props.type === 'password' ? '40px' : inputStyle.paddingRight
          }}
          autoComplete="off"
          {...props}
          type={enablePasswordToggle && showPassword ? 'text' : props.type}
        />
        
        {enablePasswordToggle && props.type === 'password' && (
          <div
            style={{
              position: 'absolute',
              right: '0',
              top: (displayLanguage || language) === 'ta' ? '-20px' : '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              paddingRight: '10px',
              zIndex: 10,
            }}
          >
            {/* Vertical Separator */}
            <div style={{ 
              height: '20px', 
              width: '1px', 
              backgroundColor: '#ccc', 
              marginRight: '10px' 
            }}></div>

            {/* Eye Icon Button */}
            <span
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--input-text, #666)',
              }}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
           {showPassword ? (
              // Eye with slash - password visible
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                <line x1="3" y1="3" x2="21" y2="21" />
              </svg>
            ) : (
              // Eye open - password hidden
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </span>
          </div>
        )}
      </div>

      {children}
      
      {helperMessage && (
        <p style={{fontSize: '10px'}} className="mt-1 text-gray-500">
          {helperMessage}
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul 
          ref={suggestionBoxRef}
          className="absolute z-50 w-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{ top: '100%' }}
        >
          {suggestions.map((sugg, idx) => (
            <li 
              key={idx}
              onClick={() => handleDisplaySuggestion(sugg)}
              className={`p-2 cursor-pointer hover:bg-blue-50 ${idx === 0 ? 'bg-blue-50 font-semibold' : ''}`}
            >
              {sugg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
