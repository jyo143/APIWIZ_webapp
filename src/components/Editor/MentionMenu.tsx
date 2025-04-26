
import React, { useState, useEffect, useRef } from 'react';

interface Person {
  id: number;
  name: string;
  role: string;
}

interface MentionMenuProps {
  position: { top: number; left: number } | null;
  onClose: () => void;
  onSelect: (person: Person) => void;
}

const people: Person[] = [
  { id: 1, name: 'Alice Johnson', role: 'Designer' },
  { id: 2, name: 'Bob Smith', role: 'Developer' },
  { id: 3, name: 'Charlie Davis', role: 'Product Manager' },
  { id: 4, name: 'Diana Wilson', role: 'Marketing' },
  { id: 5, name: 'Edward Brown', role: 'CEO' },
];

const MentionMenu: React.FC<MentionMenuProps> = ({ position, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPeople, setFilteredPeople] = useState(people);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (position && inputRef.current) {
      inputRef.current.focus();
    }
  }, [position]);

  useEffect(() => {
    const filtered = people.filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPeople(filtered);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-10 bg-white shadow-lg rounded-md border border-gray-200 w-64 py-2 animate-fade-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="px-3 pb-2">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Search people..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="max-h-60 overflow-y-auto">
        {filteredPeople.length > 0 ? (
          filteredPeople.map(person => (
            <button
              key={person.id}
              className="px-3 py-2 text-sm hover:bg-gray-100 w-full text-left flex items-start"
              onClick={() => onSelect(person)}
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center text-sm">
                {person.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{person.name}</div>
                <div className="text-xs text-gray-500">{person.role}</div>
              </div>
            </button>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
        )}
      </div>
    </div>
  );
};

export default MentionMenu;
