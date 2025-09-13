import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from 'react-native';

import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { FoodFilters } from '@/src/services/food';

interface FoodSearchFilterProps {
  onSearch: (search: string) => void;
  onFilter: (filters: FoodFilters) => void;
  categories: string[];
  currentFilters: FoodFilters;
  isLoading?: boolean;
}

export const FoodSearchFilter: React.FC<FoodSearchFilterProps> = ({
  onSearch,
  onFilter,
  categories,
  currentFilters,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchText, setSearchText] = useState(currentFilters.search || '');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<FoodFilters>(currentFilters);

  const handleSearch = (text: string) => {
    setSearchText(text);
    onSearch(text);
  };

  const handleClearSearch = () => {
    setSearchText('');
    onSearch('');
  };

  const applyFilters = () => {
    onFilter(tempFilters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters: FoodFilters = {
      page: 1,
      limit: currentFilters.limit || 20,
    };
    setTempFilters(clearedFilters);
    onFilter(clearedFilters);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Boolean(
    currentFilters.category ||
    currentFilters.dosha ||
    (currentFilters.sortBy && currentFilters.sortBy !== 'name_en') ||
    (currentFilters.sortOrder && currentFilters.sortOrder !== 'asc')
  );

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (currentFilters.category) count++;
    if (currentFilters.dosha) count++;
    if (currentFilters.sortBy && currentFilters.sortBy !== 'name_en') count++;
    if (currentFilters.sortOrder && currentFilters.sortOrder !== 'asc') count++;
    return count;
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search foods..."
          placeholderTextColor={colors.icon}
          value={searchText}
          onChangeText={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter and Sort Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { 
              backgroundColor: hasActiveFilters ? colors.herbalGreen : colors.cardBackground,
              borderColor: colors.herbalGreen,
            }
          ]}
          onPress={() => setShowFilterModal(true)}
          disabled={isLoading}
        >
          <Ionicons 
            name="options" 
            size={16} 
            color={hasActiveFilters ? 'white' : colors.herbalGreen} 
          />
          <Text style={[
            styles.filterButtonText,
            { color: hasActiveFilters ? 'white' : colors.herbalGreen }
          ]}>
            Filters
          </Text>
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.clearFiltersButton, { borderColor: colors.softOrange }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearFiltersText, { color: colors.softOrange }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.inputBorder }]}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={[styles.modalCancelText, { color: colors.softOrange }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filters & Sort</Text>
            <TouchableOpacity onPress={applyFilters}>
              <Text style={[styles.modalApplyText, { color: colors.herbalGreen }]}>Apply</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  { 
                    backgroundColor: !tempFilters.category ? colors.herbalGreen + '15' : colors.cardBackground,
                    borderColor: !tempFilters.category ? colors.herbalGreen : colors.inputBorder
                  }
                ]}
                onPress={() => setTempFilters(prev => ({ ...prev, category: undefined }))}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: !tempFilters.category ? colors.herbalGreen : colors.text }
                ]}>
                  All Categories
                </Text>
                {!tempFilters.category && (
                  <Ionicons name="checkmark" size={16} color={colors.herbalGreen} />
                )}
              </TouchableOpacity>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: tempFilters.category === category ? colors.herbalGreen + '15' : colors.cardBackground,
                      borderColor: tempFilters.category === category ? colors.herbalGreen : colors.inputBorder
                    }
                  ]}
                  onPress={() => setTempFilters(prev => ({ 
                    ...prev, 
                    category: prev.category === category ? undefined : category 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: tempFilters.category === category ? colors.herbalGreen : colors.text }
                  ]}>
                    {category}
                  </Text>
                  {tempFilters.category === category && (
                    <Ionicons name="checkmark" size={16} color={colors.herbalGreen} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Dosha Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dosha Compatibility</Text>
              {['vata', 'pitta', 'kapha'].map((dosha) => (
                <TouchableOpacity
                  key={dosha}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: tempFilters.dosha === dosha ? colors.herbalGreen + '15' : colors.cardBackground,
                      borderColor: tempFilters.dosha === dosha ? colors.herbalGreen : colors.inputBorder
                    }
                  ]}
                  onPress={() => setTempFilters(prev => ({ 
                    ...prev, 
                    dosha: prev.dosha === dosha ? undefined : dosha as any
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: tempFilters.dosha === dosha ? colors.herbalGreen : colors.text }
                  ]}>
                    Good for {dosha.charAt(0).toUpperCase() + dosha.slice(1)}
                  </Text>
                  {tempFilters.dosha === dosha && (
                    <Ionicons name="checkmark" size={16} color={colors.herbalGreen} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sort By</Text>
              {[
                { key: 'name_en', label: 'Name (A-Z)' },
                { key: 'category', label: 'Category' },
                { key: 'calories_kcal', label: 'Calories' },
                { key: 'protein_g', label: 'Protein Content' },
              ].map((sortOption) => (
                <TouchableOpacity
                  key={sortOption.key}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: tempFilters.sortBy === sortOption.key ? colors.herbalGreen + '15' : colors.cardBackground,
                      borderColor: tempFilters.sortBy === sortOption.key ? colors.herbalGreen : colors.inputBorder
                    }
                  ]}
                  onPress={() => setTempFilters(prev => ({ 
                    ...prev, 
                    sortBy: sortOption.key,
                    sortOrder: prev.sortBy === sortOption.key && prev.sortOrder === 'asc' ? 'desc' : 'asc'
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: tempFilters.sortBy === sortOption.key ? colors.herbalGreen : colors.text }
                  ]}>
                    {sortOption.label}
                  </Text>
                  {tempFilters.sortBy === sortOption.key && (
                    <Ionicons 
                      name={tempFilters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                      size={16} 
                      color={colors.herbalGreen} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  filterBadge: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalApplyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 15,
  },
});