import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { TRAITS } from '../../logic/traitsData';

export const traitConfig = {
  originName: 'Выживший',
  modalType: 'choice'
};

const SurvivorModal = ({ visible, onSelect, onClose }) => {
  const [selectionMode, setSelectionMode] = useState(null);
  const [survivorTrait, setSurvivorTrait] = useState(null);
  const [ncrTrait, setNcrTrait] = useState(null);
  const [singleTraitPick, setSingleTraitPick] = useState(null);
  const [goodSoulPicks, setGoodSoulPicks] = useState([]);
  const [giftedAttributes, setGiftedAttributes] = useState([]);

  const survivorTraitNames = ['Образованный', 'Быстрый выстрел', 'Одаренный', 'Тяжёлая рука', 'Миниатюрный'];
  const ncrTraitNames = ['Добрая Душа', 'Пехотинец', 'Дом на пастбище', 'Техника спуска', 'Браминий барон'];
  const goodSoulGroup = ['Красноречие', 'Медицина', 'Ремонт', 'Наука', 'Бартер'];
  const specialAttributes = ['STR', 'PER', 'END', 'CHA', 'INT', 'AGI', 'LCK'];

  const traitCatalog = useMemo(() => {
    const toTrait = (name) => ({ name, description: TRAITS[name]?.description || '' });
    return {
      survivor: survivorTraitNames.map(toTrait),
      ncr: ncrTraitNames.map(toTrait),
    };
  }, []);

  const resetState = () => {
    setSelectionMode(null);
    setSurvivorTrait(null);
    setNcrTrait(null);
    setSingleTraitPick(null);
    setGoodSoulPicks([]);
    setGiftedAttributes([]);
  };

  const toggleGoodSoulPick = (skill) => {
    setGoodSoulPicks((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= 2) return prev;
      return [...prev, skill];
    });
  };

  const toggleGiftedAttribute = (attr) => {
    setGiftedAttributes((prev) => {
      if (prev.includes(attr)) return prev.filter((a) => a !== attr);
      if (prev.length >= 2) return prev;
      return [...prev, attr];
    });
  };

  const buildTraitModifiers = (name) => {
    const modifiers = {};

    if (name === 'Добрая Душа') {
      modifiers.forcedSkills = [...goodSoulPicks];
      modifiers.goodSoulSelectedSkills = [...goodSoulPicks];
      modifiers.goodSoulGroup = [...goodSoulGroup];
    }

    if (name === 'Одаренный') {
      const attributes = giftedAttributes.reduce((acc, key) => ({ ...acc, [key]: 1 }), {});
      modifiers.attributes = attributes;
      modifiers.giftedAttributes = [...giftedAttributes];
    }

    return modifiers;
  };

  const canConfirm = () => {
    if (selectionMode === 'two_traits') {
      if (!survivorTrait || !ncrTrait) return false;
      if ((survivorTrait === 'Одаренный' || ncrTrait === 'Одаренный') && giftedAttributes.length !== 2) return false;
      if ((survivorTrait === 'Добрая Душа' || ncrTrait === 'Добрая Душа') && goodSoulPicks.length !== 2) return false;
      return true;
    }

    if (selectionMode === 'trait_and_perk') {
      if (!singleTraitPick) return false;
      if (singleTraitPick === 'Одаренный' && giftedAttributes.length !== 2) return false;
      if (singleTraitPick === 'Добрая Душа' && goodSoulPicks.length !== 2) return false;
      return true;
    }

    return false;
  };

  const handleConfirm = () => {
    if (!canConfirm()) return;

    const selectedNames = selectionMode === 'two_traits'
      ? [survivorTrait, ncrTrait]
      : [singleTraitPick];

    const mergedModifiers = selectedNames.reduce((acc, traitName) => {
      const baseModifiers = TRAITS[traitName]?.modifiers || {};
      return {
        ...acc,
        ...baseModifiers,
        ...buildTraitModifiers(traitName),
        attributes: {
          ...(acc.attributes || {}),
          ...(baseModifiers.attributes || {}),
          ...(buildTraitModifiers(traitName).attributes || {}),
        },
        forcedSkills: [
          ...(acc.forcedSkills || []),
          ...(baseModifiers.forcedSkills || []),
          ...(buildTraitModifiers(traitName).forcedSkills || []),
        ],
        goodSoulSelectedSkills: [
          ...(acc.goodSoulSelectedSkills || []),
          ...(buildTraitModifiers(traitName).goodSoulSelectedSkills || []),
        ],
      };
    }, {});

    if (selectionMode === 'trait_and_perk') {
      mergedModifiers.extraPerkSlots = (mergedModifiers.extraPerkSlots || 0) + 1;
    }

    const traitTitle = selectionMode === 'two_traits'
      ? `Выживший: ${survivorTrait} + ${ncrTrait}`
      : `Выживший: ${singleTraitPick} + 1 перк`;

    onSelect(traitTitle, {
      ...mergedModifiers,
      selectedTraitNames: selectedNames,
      selectionMode,
    });
    resetState();
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Черта происхождения «Выживший»</Text>
          {!selectionMode && (
            <View style={{ width: '100%' }}>
              <TouchableOpacity style={[styles.modalButton, styles.skillOption]} onPress={() => setSelectionMode('two_traits')}>
                <Text style={styles.buttonText}>2 черты</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.skillOption]} onPress={() => setSelectionMode('trait_and_perk')}>
                <Text style={styles.buttonText}>1 черта и 1 перк</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectionMode && (
            <ScrollView style={{ width: '100%', maxHeight: 360 }}>
              <Text style={styles.sectionTitle}>Список черт Выжившего</Text>
              {traitCatalog.survivor.map((trait) => (
                <TouchableOpacity
                  key={`survivor-${trait.name}`}
                  style={[
                    styles.modalButton,
                    styles.skillOption,
                    ((selectionMode === 'two_traits' && survivorTrait === trait.name) || singleTraitPick === trait.name) && styles.selectedButton,
                  ]}
                  onPress={() => {
                    if (selectionMode === 'two_traits') setSurvivorTrait(trait.name);
                    else setSingleTraitPick(trait.name);
                  }}
                >
                  <Text style={styles.buttonText}>{trait.name}</Text>
                  <Text style={styles.descriptionText}>{trait.description}</Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.sectionTitle}>Список черт НКР</Text>
              {traitCatalog.ncr.map((trait) => (
                <TouchableOpacity
                  key={`ncr-${trait.name}`}
                  style={[
                    styles.modalButton,
                    styles.skillOption,
                    ((selectionMode === 'two_traits' && ncrTrait === trait.name) || singleTraitPick === trait.name) && styles.selectedButton,
                  ]}
                  onPress={() => {
                    if (selectionMode === 'two_traits') setNcrTrait(trait.name);
                    else setSingleTraitPick(trait.name);
                  }}
                >
                  <Text style={styles.buttonText}>{trait.name}</Text>
                  <Text style={styles.descriptionText}>{trait.description}</Text>
                </TouchableOpacity>
              ))}

              {(survivorTrait === 'Добрая Душа' || ncrTrait === 'Добрая Душа' || singleTraitPick === 'Добрая Душа') && (
                <View style={{ width: '100%' }}>
                  <Text style={styles.sectionTitle}>Добрая Душа: выберите 2 навыка</Text>
                  {goodSoulGroup.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[styles.modalButton, styles.skillOption, goodSoulPicks.includes(skill) && styles.selectedButton]}
                      onPress={() => toggleGoodSoulPick(skill)}
                    >
                      <Text style={styles.buttonText}>{skill}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(survivorTrait === 'Одаренный' || ncrTrait === 'Одаренный' || singleTraitPick === 'Одаренный') && (
                <View style={{ width: '100%' }}>
                  <Text style={styles.sectionTitle}>Одаренный: выберите 2 атрибута S.P.E.C.I.A.L.</Text>
                  {specialAttributes.map((attr) => (
                    <TouchableOpacity
                      key={attr}
                      style={[styles.modalButton, styles.skillOption, giftedAttributes.includes(attr) && styles.selectedButton]}
                      onPress={() => toggleGiftedAttribute(attr)}
                    >
                      <Text style={styles.buttonText}>{attr}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
          {selectionMode && (
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, !canConfirm() && styles.disabledButton]}
              disabled={!canConfirm()}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonText}>Подтвердить выбор</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              resetState();
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalButton: {
        padding: 12,
        marginVertical: 5,
        borderRadius: 6,
        alignItems: 'center',
        width: '100%',
    },
    skillOption: {
        backgroundColor: '#2196F3',
        alignItems: 'flex-start',
        paddingHorizontal: 15,
    },
    cancelButton: {
        backgroundColor: '#9E9E9E',
        marginTop: 10
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    disabledButton: {
      opacity: 0.5,
    },
    sectionTitle: {
      color: '#000',
      fontWeight: '700',
      marginTop: 10,
      marginBottom: 6,
    },
    selectedButton: {
      borderWidth: 2,
      borderColor: '#FFFFFF',
      backgroundColor: '#1976D2',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    descriptionText: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
    }
});

export default SurvivorModal; 
