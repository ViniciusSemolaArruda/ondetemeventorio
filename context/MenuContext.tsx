import React, { createContext, useContext, useState } from 'react';

// Tipo do contexto
type MenuContextType = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
};

// Criação do contexto com valores padrão
const MenuContext = createContext<MenuContextType>({
  isOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
});

// Provider que envolve o app ou parte do app
export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  return (
    <MenuContext.Provider value={{ isOpen, openMenu, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useMenu = () => useContext(MenuContext);
