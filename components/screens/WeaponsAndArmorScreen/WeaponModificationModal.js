import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert 
} from 'react-native';
import { applyModificationToSlot, getAvailableModifications } from './weaponModificationUtils';
import lightWeaponMods from '../../../assets/Equipment/light_weapon_mods.json';

// Компонент для сворачиваемой секции
const CollapsibleSection = ({ title, children, isExpanded, onToggle }) => {
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity onPress={onToggle} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

const WeaponModificationModal = ({ visible, onClose, weapon, onApplyModification }) => {
  const [selectedModifications, setSelectedModifications] = useState({}); // category -> modification
  const [modifiedWeapon, setModifiedWeapon] = useState(weapon);
  const [expandedCategories, setExpandedCategories] = useState({}); // category -> boolean

  // Обновляем modifiedWeapon при изменении weapon
  React.useEffect(() => {
    if (weapon && visible) {
      setModifiedWeapon(weapon);
      // Загружаем уже установленные моды как выбранные
      setSelectedModifications(weapon._installedMods || {});
    }
  }, [weapon, visible]);

  // Получаем доступные модификации для данного оружия
  const availableModifications = weapon && weapon.Модификации ? getAvailableModifications(weapon, lightWeaponMods.Модификации) : {};
  
  // Преобразуем в формат для отображения
  const modificationsForDisplay = Object.entries(availableModifications).flatMap(([category, mods]) =>
    mods.map(mod => ({
      name: mod.name,
      category: category,
      data: mod.data
    }))
  );

  // Группируем модификации по категориям
  const modificationsByCategory = modificationsForDisplay.reduce((acc, mod) => {
    if (!acc[mod.category]) {
      acc[mod.category] = [];
    }
    acc[mod.category].push(mod);
    return acc;
  }, {});

  const handleToggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSelectModification = (mod) => {
    if (!weapon) return;

    // Строим новый набор выбранных модов (UI-состояние)
    const newSelected = { ...selectedModifications, [mod.category]: mod };
    setSelectedModifications(newSelected);

    // Пересчитываем оружие от базы, применяя все выбранные моды
    // Используем applyModificationToSlot последовательно для каждого выбранного мода
    const categories = Object.keys(newSelected);
    let result = weapon;
    for (const cat of categories) {
      result = applyModificationToSlot(result, cat, newSelected[cat]);
    }

    setModifiedWeapon(result);
  };

  const handleApplyModification = () => {
    if (!weapon) {
      return;
    }
    
    const modificationsArray = Object.values(selectedModifications);
    if (modificationsArray.length > 0) {
      onApplyModification(modifiedWeapon);
    } else {
      Alert.alert("Ошибка", "Выберите хотя бы одну модификацию");
    }
  };

  const handleClose = () => {
    setSelectedModifications({});
    setExpandedCategories({});
    onClose();
  };

  // Если оружие не передано или не имеет необходимых свойств, не показываем модальное окно
  if (!weapon || !weapon.Название || !weapon.Модификации) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Модификации оружия</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Информация об оружии */}
            <View style={styles.weaponInfo}>
              <Text style={styles.weaponTitle}>{weapon?.Название || 'Неизвестное оружие'}</Text>
              <Text style={styles.weaponStats}>
                Урон: {weapon?.Урон || 0} | Скорость: {weapon?.['Скорость стрельбы'] || 0} | 
                Дистанция: {weapon?.['Дистанция'] || 'Близкая'} | Вес: {weapon?.Вес || 0} | Цена: {weapon?.Цена || 0}
              </Text>
            </View>

            {/* Доступные модификации */}
            <View style={styles.modificationsSection}>
              <Text style={styles.sectionTitle}>Доступные модификации:</Text>
              {Object.entries(modificationsByCategory).map(([category, mods]) => (
                <CollapsibleSection
                  key={category}
                  title={`${category} (${mods.length})`}
                  isExpanded={expandedCategories[category]}
                  onToggle={() => handleToggleCategory(category)}
                >
                  {mods.map((mod, index) => (
                                         <TouchableOpacity
                       key={index}
                       style={[
                         styles.modificationItem,
                         selectedModifications[mod.category]?.name === mod.name && styles.selectedModification
                       ]}
                       onPress={() => handleSelectModification(mod)}
                     >
                       <Text style={styles.modificationName}>{mod.name}</Text>
                       <Text style={styles.modificationEffects}>{mod.data.Эффекты}</Text>
                       <Text style={styles.modificationStats}>
                         Вес: {mod.data.Вес >= 0 ? '+' : ''}{mod.data.Вес} | Цена: +{mod.data.Цена}
                       </Text>
                     </TouchableOpacity>
                  ))}
                </CollapsibleSection>
              ))}
            </View>

            {/* Предварительный просмотр */}
            {Object.keys(selectedModifications).length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Предварительный просмотр:</Text>
                <View style={styles.previewContent}>
                                     <Text style={styles.previewTitle}>
                     {modifiedWeapon.Название}
                   </Text>
                  <Text style={styles.previewStats}>
                    Урон: {modifiedWeapon.Урон} | Скорость: {modifiedWeapon['Скорость стрельбы']} | 
                    Дистанция: {modifiedWeapon['Дистанция'] || 'Близкая'} | Вес: {modifiedWeapon.Вес} | Цена: {modifiedWeapon.Цена}
                  </Text>
                  <Text style={styles.previewEffects}>
                    Эффекты: {modifiedWeapon.Эффекты}
                  </Text>
                  <Text style={styles.previewQualities}>
                    Качества: {modifiedWeapon.Качества}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Кнопки действий */}
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleApplyModification} 
              style={[styles.applyButton, Object.keys(selectedModifications).length === 0 && styles.disabledButton]}
              disabled={Object.keys(selectedModifications).length === 0}
            >
              <Text style={styles.applyButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalBody: {
    padding: 15,
  },
  weaponInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  weaponTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  weaponStats: {
    fontSize: 12,
    color: '#666',
  },
  modificationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  collapsibleSection: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
  },
  sectionContent: {
    paddingLeft: 10,
    paddingTop: 5,
  },
  modificationItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedModification: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  modificationName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modificationCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modificationEffects: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    flexWrap: 'wrap',
  },
  modificationStats: {
    fontSize: 11,
    color: '#666',
    marginTop: 3,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewContent: {
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  previewStats: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  previewEffects: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  previewQualities: {
    fontSize: 12,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
  },
  applyButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WeaponModificationModal; 