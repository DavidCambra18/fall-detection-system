import 'package:fall_detection_system/screens/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'screens/dashboard_screen.dart';

void main() async {
  // Aseguramos que los formatos de fecha en español funcionen
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es', null);
  
  runApp(const FallMonitorApp());
}

class FallMonitorApp extends StatelessWidget {
  const FallMonitorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fall Detection System',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        // Configuración de colores profesional
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F172A),
          primary: const Color(0xFF3B82F6),
        ),
      ),
      home: const LoginScreen(),
    );
  }
}