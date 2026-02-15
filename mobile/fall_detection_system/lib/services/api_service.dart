import 'dart:convert';

import 'package:fall_detection_system/models/fall_model.dart';
import 'package:http/http.dart' as http;

class ApiService {
  static const String url = "https://fall-detection-system-6qw5.onrender.com/api/";

  Future<List<Fall>> getFalls() async {
    final response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      List<dynamic> body = json.decode(response.body);
      return body.map((item) => Fall.fromJson(item)).toList();
    } else {
      throw "Error al conectar con Render";
    }
  }
}