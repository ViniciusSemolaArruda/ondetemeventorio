import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { logout, useGoogleAuth } from '../hooks/useGoogleLogin';

export default function SidebarSheet() {
  const { user } = useAuth();
  const { closeMenu } = useMenu();
  const router = useRouter();

  const { signInWithGoogle } = useGoogleAuth();

  const handleLogin = () => {
    signInWithGoogle();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <View>
      <Text style={styles.title}>Menu</Text>

      {user ? (
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: user.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>Olá, {user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.prompt}>Olá, faça seu login!</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Image
              source={require('../assets/images/google.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.loginText}>Entrar com Google</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.links}>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => {
            router.push('/');
            closeMenu();
          }}
        >
          <Ionicons name="home-outline" size={18} />
          <Text style={styles.linkText}>Início</Text>
        </TouchableOpacity>
      </View>

      {user && (
        <TouchableOpacity style={styles.linkBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} />
          <Text style={styles.linkText}>Sair da conta</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  name: { fontWeight: 'bold' },
  email: { fontSize: 12, color: 'gray' },
  loginContainer: { marginBottom: 20 },
  prompt: { fontSize: 16, fontWeight: 'bold' },
  loginBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
  },
  googleIcon: { width: 20, height: 20, marginRight: 8 },
  loginText: { fontWeight: '600' },
  links: { marginTop: 20 },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  linkText: { fontSize: 16 },
});
