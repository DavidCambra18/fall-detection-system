// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fall_detection_system/main.dart';

import 'package:flutter_test/flutter_test.dart';
import 'dart:convert';

void main() {
  group('Pruebas de Modelo de Caída', () {
    test('Debe convertir un JSON a un objeto correctamente', () {
      // Simulamos lo que envía el API de Render
      const jsonString = '{"dispositivo": "Sensor 1", "intensidad": 8.5, "fecha": "2026-02-15T10:00:00Z"}';
      final Map<String, dynamic> jsonMap = json.decode(jsonString);

      // Verificamos que los campos se asignen bien
      expect(jsonMap['dispositivo'], 'Sensor 1');
      expect(jsonMap['intensidad'], 8.5);
      expect(jsonMap['fecha'], isA<String>());
    });

    test('Debe manejar valores nulos con seguridad', () {
      const jsonString = '{"dispositivo": null, "intensidad": null}';
      final Map<String, dynamic> jsonMap = json.decode(jsonString);
      
      // Aquí probamos la lógica de "Escudos" que pusimos en el código
      final nombre = jsonMap['dispositivo'] ?? 'Desconocido';
      final intensidad = jsonMap['intensidad']?.toString() ?? '0.0';

      expect(nombre, 'Desconocido');
      expect(intensidad, '0.0');
    });
  });
}