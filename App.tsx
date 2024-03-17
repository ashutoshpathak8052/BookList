import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TextInput, StyleSheet, TouchableOpacity, AsyncStorage } from 'react-native';
import FastImage from 'react-native-fast-image';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchBooks();
    loadFavorites();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('https://openlibrary.org/subjects/sci-fi.json?details=true');
      const data = await response.json();
      setBooks(data.works);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = (item) => {
    const index = favorites.findIndex(book => book.key === item.key);
    if (index === -1) {
      setFavorites([...favorites, item]);
    } else {
      const updatedFavorites = favorites.filter(book => book.key !== item.key);
      setFavorites(updatedFavorites);
    }
  };

  const isFavorite = (item) => {
    return favorites.some(book => book.key === item.key);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }
    try {
      const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setBooks(data.docs);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      <FlatList
        data={books}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.bookItem} onPress={() => toggleFavorite(item)}>
            <FastImage
              source={{ uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` }}
              style={styles.coverImage}
            />
            <View style={styles.bookDetails}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>Author(s): {item.author_name ? item.author_name.join(', ') : 'N/A'}</Text>
              <Text style={styles.year}>Publication Year: {item.first_publish_year ? item.first_publish_year : 'N/A'}</Text>
            </View>
            {isFavorite(item) ? (
              <Text style={styles.favoriteText}>❤️</Text>
            ) : (
              <Text style={styles.favoriteText}>🤍</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    alignItems: 'center',
  },
  coverImage: {
    width: 80,
    height: 120,
    marginRight: 10,
  },
  bookDetails: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
    marginBottom: 3,
  },
  year: {
    fontSize: 14,
  },
  favoriteText: {
    fontSize: 20,
  },
});

export default BookList;
