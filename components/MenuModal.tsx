// components/MenuModal.tsx
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { useMenu } from '../context/MenuContext';
import SidebarSheet from './SidebarSheet';

const { width } = Dimensions.get('window');

export default function MenuModal() {
  const { isOpen, closeMenu } = useMenu();

  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={closeMenu}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      backdropOpacity={0.3}
      style={styles.modal}
    >
      <View style={styles.sidebar}>
        <SidebarSheet />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  sidebar: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
  },
});
