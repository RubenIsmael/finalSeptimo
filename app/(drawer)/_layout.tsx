import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Users, Heart, MessageCircle, Phone, MapPin, Clock } from 'lucide-react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';

function CustomDrawerContent(props: any) {
  const router = useRouter();

  const menuItems = [
    { label: 'Inicio', icon: Home, route: '/(drawer)/home' },
    { label: 'Quiénes Somos', icon: Users, route: '/(drawer)/about' },
    { label: 'Ayuda Comunitaria', icon: Heart, route: '/(drawer)/community' },
    { label: 'Comunícate con Nosotros', icon: MessageCircle, route: '/(drawer)/contact' },
  ];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      <LinearGradient
        colors={['#87CEEB', '#F5F5DC']}
        style={styles.header}
      >
        <Image
          source={{ uri: 'https://scontent.fuio35-1.fna.fbcdn.net/v/t39.30808-1/435977636_122097696560271946_1795400588662181208_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=100&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=K1ppGMkRUJgQ7kNvwHlRh4w&_nc_oc=AdlEx8Y_sN_RMPntZSqtNW4PJwAXbew7QxZh-o9fEJu7OD7Rx-ZtHtXAAxNJd4z8Qrs&_nc_zt=24&_nc_ht=scontent.fuio35-1.fna&_nc_gid=N77w_wHPYW0MKbbss37vMg&oh=00_AfYmV6v5pAO0-NbmaMTgw7pXbYpE-27XIy4CCVjUbHmWEA&oe=68C13085' }}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Cementerio</Text>
        <Text style={styles.headerSubtitle}>San Agustín</Text>
        <Text style={styles.headerLocation}>La Concordia</Text>
      </LinearGradient>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8F8FF']}
              style={styles.menuItemGradient}
            >
              <item.icon size={24} color="#4682B4" />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <MapPin size={16} color="#666" />
            <Text style={styles.contactText}>La Concordia, Santo Domingo</Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={16} color="#666" />
            <Text style={styles.contactText}>+593 2 XXX-XXXX</Text>
          </View>
          <View style={styles.contactItem}>
            <Clock size={16} color="#666" />
            <Text style={styles.contactText}>Lun-Vie: 8:00 AM - 5:00 PM</Text>
          </View>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: 'transparent',
          width: 300,
        },
        drawerType: 'slide',
      }}
    >
      <Drawer.Screen name="home" />
      <Drawer.Screen name="about" />
      <Drawer.Screen name="community" />
      <Drawer.Screen name="contact" />
      <Drawer.Screen name="reservations" />
      <Drawer.Screen name="payments" />
      <Drawer.Screen name="consultations" />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomRightRadius: 25,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    textAlign: 'center',
  },
  headerLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  menuItem: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 15,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
  },
});