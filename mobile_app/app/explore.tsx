import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { FoodCard } from '@/src/components/food/FoodCard';
import { FoodSearchFilter } from '@/src/components/food/FoodSearchFilter';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Food, FoodService, FoodFilters, FoodsResponse } from '@/src/services/food';

interface ExploreState {
  foods: Food[];
  categories: string[];
  pagination: FoodsResponse['pagination'] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  filters: FoodFilters;
  error: string | null;
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [state, setState] = useState<ExploreState>({
    foods: [],
    categories: [],
    pagination: null,
    isLoading: true,
    isRefreshing: false,
    isLoadingMore: false,
    filters: {
      page: 1,
      limit: 20,
      sortBy: 'name_en',
      sortOrder: 'asc',
    },
    error: null,
  });

  // Load initial data
  const loadInitialData = useCallback(async () => {
    console.log('🔄 Loading initial data for explore screen...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Load categories and initial foods in parallel
      console.log('📡 Fetching categories and foods from API...');
      const [categoriesResponse, foodsResponse] = await Promise.all([
        FoodService.getCategories(),
        FoodService.getAllFoods(state.filters),
      ]);

      console.log('📋 Categories response:', categoriesResponse);
      console.log('🍎 Foods response:', foodsResponse);

      if (!categoriesResponse.success) {
        console.warn('⚠️ Categories failed:', categoriesResponse.error);
        // Continue anyway, categories are not critical
      }

      if (!foodsResponse.success) {
        console.warn('⚠️ Foods failed:', foodsResponse.error);
        // Set empty data but don't fail completely
        setState(prev => ({
          ...prev,
          categories: categoriesResponse.success ? categoriesResponse.data || [] : [],
          foods: [],
          pagination: null,
          isLoading: false,
          error: foodsResponse.error || 'Failed to load foods',
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        categories: categoriesResponse.success ? categoriesResponse.data || [] : [],
        foods: foodsResponse.data?.foods || [],
        pagination: foodsResponse.data?.pagination || null,
        isLoading: false,
      }));
      
      console.log('✅ Explore data loaded successfully');
    } catch (error) {
      console.error('❌ Load initial data error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      }));
    }
  }, [state.filters]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadFoods = async (filters: FoodFilters, append: boolean = false) => {
    if (append) {
      setState(prev => ({ ...prev, isLoadingMore: true }));
    } else {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const response = await FoodService.getAllFoods(filters);

      if (!response.success) {
        throw new Error(response.error || 'Failed to load foods');
      }

      setState(prev => ({
        ...prev,
        foods: append 
          ? [...prev.foods, ...(response.data?.foods || [])]
          : response.data?.foods || [],
        pagination: response.data?.pagination || null,
        filters,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch (error) {
      console.error('Load foods error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load foods',
        isLoading: false,
        isLoadingMore: false,
      }));
    }
  };

  const handleSearch = useCallback((search: string) => {
    const newFilters: FoodFilters = {
      ...state.filters,
      search: search || undefined,
      page: 1,
    };
    loadFoods(newFilters);
  }, [state.filters]);

  const handleFilter = useCallback((filters: FoodFilters) => {
    const newFilters: FoodFilters = {
      ...filters,
      page: 1,
    };
    loadFoods(newFilters);
  }, []);

  const handleRefresh = useCallback(() => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    const refreshFilters = { ...state.filters, page: 1 };
    loadFoods(refreshFilters).finally(() => {
      setState(prev => ({ ...prev, isRefreshing: false }));
    });
  }, [state.filters]);

  const handleLoadMore = useCallback(() => {
    if (state.pagination?.hasNext && !state.isLoadingMore) {
      const nextPageFilters: FoodFilters = {
        ...state.filters,
        page: (state.pagination.currentPage || 1) + 1,
      };
      loadFoods(nextPageFilters, true);
    }
  }, [state.pagination, state.filters, state.isLoadingMore]);

  const handleRetry = () => {
    loadInitialData();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.herbalGreen} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Explore Foods
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Discover Ayurvedic nutrition wisdom
          </Text>
        </View>
      </View>
      
      <FoodSearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        categories={state.categories}
        currentFilters={state.filters}
        isLoading={state.isLoading}
      />
      
      {state.pagination && (
        <View style={styles.resultsInfo}>
          <Text style={[styles.resultsText, { color: colors.icon }]}>
            Showing {state.foods.length} of {state.pagination.total} foods
          </Text>
        </View>
      )}
    </View>
  );

  const renderFood = ({ item }: { item: Food }) => (
    <FoodCard
      food={item}
    />
  );

  const renderFooter = () => {
    if (!state.isLoadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="large" color={colors.herbalGreen} />
        <Text style={[styles.loadingText, { color: colors.icon }]}>
          Loading more foods...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (state.isLoading) return null;
    
    return (
      <View style={styles.emptyState}>
        <Ionicons name="restaurant-outline" size={64} color={colors.icon} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No foods found
        </Text>
        <Text style={[styles.emptyMessage, { color: colors.icon }]}>
          Try adjusting your search or filters
        </Text>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.softOrange} />
      <Text style={[styles.errorTitle, { color: colors.text }]}>
        Oops! Something went wrong
      </Text>
      <Text style={[styles.errorMessage, { color: colors.icon }]}>
        {state.error}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.herbalGreen }]}
        onPress={handleRetry}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (state.error && state.foods.length === 0) {
    return (
      <ThemedView style={styles.container}>
        {renderHeader()}
        {renderError()}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={state.foods}
        renderItem={renderFood}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.herbalGreen]}
            tintColor={colors.herbalGreen}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          state.foods.length === 0 && styles.emptyListContent
        ]}
      />

      {state.isLoading && state.foods.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.herbalGreen} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Loading delicious foods...
          </Text>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 2,
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  resultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
