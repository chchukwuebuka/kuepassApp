import styles from "./styles.module.css";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search Attendee"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      <button className={styles.searchButton}>Search</button>
    </div>
  );
};

export default SearchBar;
