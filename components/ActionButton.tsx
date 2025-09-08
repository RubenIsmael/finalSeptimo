import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  colors: readonly [string, string, ...string[]];
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function ActionButton({ title, onPress, colors, icon, style }: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <View style={[style, isPressed && styles.pressedContainer]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.buttonContainer,
          isPressed && styles.pressedButton
        ]}
      >
        {/* Borde con gradiente */}
        <LinearGradient 
          colors={colors} 
          style={[
            styles.borderGradient,
            isPressed && styles.pressedBorder
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Contenido con fondo blanco */}
          <View style={styles.contentContainer}>
            <View style={styles.iconContainer}>
              {icon}
            </View>
            <Text style={styles.text}>{title}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  pressedContainer: {
    transform: [{ scale: 0.96 }],
  },
  pressedButton: {
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  borderGradient: {
    padding: 3,
    borderRadius: 16,
  },
  pressedBorder: {
    padding: 4,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#333333',
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    fontWeight: '600',
  },
});