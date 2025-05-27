import { StyleSheet } from 'react-native';

export const headerStyles = StyleSheet.create({
  enhancedHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  iconButton: {
    padding: 8,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  enhancedHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
});
