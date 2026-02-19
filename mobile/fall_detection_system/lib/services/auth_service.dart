import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthService {
  final String baseUrl = "https://fall-detection-system-6qw5.onrender.com/api/auth";

  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      print("--- Intentando Login ---");
      print("URL: $baseUrl/login");
      
      final response = await http.post(
        Uri.parse("$baseUrl/login"),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: jsonEncode({
          "email": email,
          "password": password,
        }),
      );

      print("Status Code: ${response.statusCode}");
      print("Respuesta Body: ${response.body}");

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        // Aquí sabremos si es 401 (malas credenciales) o 404 (ruta mal)
        return null;
      }
    } catch (e) {
      print("ERROR DE RED: $e");
      return null;
    }
  }
}