import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { ThemedView } from '../common/ThemedView';
import { ThemedText } from '../common/ThemedText';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface LanguageSelectorProps {
  style?: any;
  compact?: boolean; // For smaller displays like in headers
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  style,
  compact = false,
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, availableLanguages, isLoading } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const currentLangInfo = availableLanguages[currentLanguage as keyof typeof availableLanguages];

  const handleLanguageSelect = async (languageCode: string) => {
    setModalVisible(false);
    await setLanguage(languageCode);
  };

  const renderLanguageItem = ({ item }: { item: [string, any] }) => {
    const [code, info] = item;
    const isSelected = code === currentLanguage;

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          {
            backgroundColor: isSelected ? colors.herbalGreen + '20' : 'transparent',
            borderColor: colors.inputBorder,
          },
        ]}
        onPress={() => handleLanguageSelect(code)}
      >
        <View style={styles.languageItemContent}>
          <Text style={styles.flag}>{info.flag}</Text>
          <View style={styles.languageText}>
            <Text style={[styles.languageName, { color: colors.text }]}>
              {info.name}
            </Text>
            <Text style={[styles.nativeName, { color: colors.icon }]}>
              {info.nativeName}
            </Text>
          </View>
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.herbalGreen}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <TouchableOpacity
          style={[styles.compactButton, { borderColor: colors.inputBorder }]}
          onPress={() => setModalVisible(true)}
          disabled={isLoading}
        >
          <Text style={styles.compactFlag}>{currentLangInfo?.flag || '🌐'}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.icon}
            style={styles.compactIcon}
          />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.inputBorder }]}>
                <ThemedText style={styles.modalTitle}>
                  {t('common.selectLanguage')}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={Object.entries(availableLanguages)}
                renderItem={renderLanguageItem}
                keyExtractor={([code]) => code}
                style={styles.languageList}
              />
            </ThemedView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <ThemedText style={[styles.label, { color: colors.text }]}>
          {t('common.language')}
        </ThemedText>
      )}
      
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.background,
            borderColor: colors.inputBorder,
          },
        ]}
        onPress={() => setModalVisible(true)}
        disabled={isLoading}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectedFlag}>{currentLangInfo?.flag || '🌐'}</Text>
          <Text style={[styles.selectedText, { color: colors.text }]}>
            {currentLangInfo?.name || 'English'}
          </Text>
          <Text style={[styles.selectedNative, { color: colors.icon }]}>
            {currentLangInfo?.nativeName || 'English'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.icon} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.inputBorder }]}>
              <ThemedText style={styles.modalTitle}>
                {t('common.selectLanguage')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={Object.entries(availableLanguages)}
              renderItem={renderLanguageItem}
              keyExtractor={([code]) => code}
              style={styles.languageList}
            />
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  compactContainer: {
    alignSelf: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  compactFlag: {
    fontSize: 20,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  selectedNative: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  compactIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    borderBottomWidth: 1,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  nativeName: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});