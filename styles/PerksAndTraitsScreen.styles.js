import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  scrollView: { width: '100%' },
  table: { width: '100%', borderWidth: 1, borderColor: '#5a5a5a' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#5a5a5a',
    backgroundColor: '#fff',
    borderStyle: 'dotted',
    minHeight: 30,
  },
  headerRow: { backgroundColor: '#1a1a1a' },
  cell: {
    padding: 10,
    color: '#000',
    borderRightWidth: 1,
    borderRightColor: '#5a5a5a',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#fff',
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
  },
  nameColumn: { flex: 2, minWidth: 100 },
  rankColumn: { flex: 0.5, textAlign: 'center', minWidth: 60 },
  descriptionColumn: { flex: 3, borderRightWidth: 0, minWidth: 150 },
  placeholder: { padding: 10, color: '#888', textAlign: 'center' },
  addPerkButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#0369a1',
  },
  addPerkButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default styles;
