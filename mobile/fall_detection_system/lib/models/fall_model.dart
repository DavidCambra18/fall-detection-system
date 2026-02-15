class Fall {
  final String dispositivo;
  final double intensidad;
  final DateTime fecha;

  Fall({required this.dispositivo, required this.intensidad, required this.fecha});

  factory Fall.fromJson(Map<String, dynamic> json) {
    return Fall(
      dispositivo: json['dispositivo'] ?? 'Desconocido',
      intensidad: double.tryParse(json['intensidad'].toString()) ?? 0.0,
      fecha: DateTime.parse(json['fecha'] ?? DateTime.now().toString()),
    );
  }
}