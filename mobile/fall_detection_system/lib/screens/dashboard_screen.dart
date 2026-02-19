import 'package:fall_detection_system/screens/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

class DashboardScreen extends StatefulWidget {
  final int? carerId;
  final String? userName;

  const DashboardScreen({super.key, this.carerId, this.userName});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final String apiUrl =
      "https://fall-detection-system-6qw5.onrender.com/api/events";
  List<dynamic> _caidas = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _refreshData();
  }

  void _handleLogout(BuildContext context) {
    // Aquí podrías limpiar tokens o caché si usas SharedPreferences más adelante
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  Future<void> _refreshData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    // Si tenemos el ID, lo añadimos como parámetro a la URL
    String url = apiUrl;
    if (widget.carerId != null) {
      url = "$apiUrl?carer_id=${widget.carerId}";
    }

    try {
      final response = await http
          .get(Uri.parse(url))
          .timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _caidas = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error al sincronizar datos")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    bool systemOk = _caidas.isEmpty;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 200.0,
              floating: false,
              pinned: true,
              backgroundColor: const Color(0xFF1E293B),
              // BOTÓN DE LOGOUT AQUÍ
              actions: [
                IconButton(
                  icon: const Icon(Icons.logout_rounded, color: Colors.white70),
                  tooltip: 'Cerrar Sesión',
                  onPressed: () => _showLogoutDialog(context),
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                title: Text(
                  widget.userName != null
                      ? "Hola, ${widget.userName}"
                      : "Monitor de Salud",
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    fontSize: 18,
                  ),
                ),
                centerTitle: true,
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                    ),
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(child: _buildStatusCard(systemOk)),
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(25, 20, 25, 10),
                child: Text(
                  "REGISTROS RECIENTES",
                  style: TextStyle(
                    letterSpacing: 1.2,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.blueGrey,
                  ),
                ),
              ),
            ),
            _isLoading
                ? const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  )
                : _buildFallsList(),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _refreshData,
        backgroundColor: const Color(0xFF3B82F6),
        child: const Icon(Icons.refresh, color: Colors.white),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          "Cerrar Sesión",
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          "¿Estás seguro de que deseas salir?",
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              "CANCELAR",
              style: TextStyle(color: Colors.blueGrey),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              Navigator.pop(context); // Cierra el diálogo
              _handleLogout(context); // Vuelve al login
            },
            child: const Text("SALIR", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(bool ok) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: ok
              ? [const Color(0xFF10B981), const Color(0xFF059669)]
              : [const Color(0xFFEF4444), const Color(0xFFB91C1C)],
        ),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        children: [
          Icon(
            ok ? Icons.check_circle_outline : Icons.warning_amber_rounded,
            color: Colors.white,
            size: 45,
          ),
          const SizedBox(width: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                ok ? "SISTEMA OK" : "HAY IMPACTOS",
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                ok ? "Sin anomalías hoy" : "Revisa el historial",
                style: TextStyle(color: Colors.white.withOpacity(0.8)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFallsList() {
    if (_caidas.isEmpty) {
      return const SliverFillRemaining(
        child: Center(child: Text("No se han encontrado registros")),
      );
    }
    return SliverList(
      delegate: SliverChildBuilderDelegate((context, index) {
        final item = _caidas[index];
        final date = DateTime.parse(item['fecha'] ?? DateTime.now().toString());
        final double g =
            double.tryParse(item['intensidad']?.toString() ?? "0") ?? 0;

        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          child: ListTile(
            leading: Icon(
              Icons.sensors,
              color: g > 5 ? Colors.red : Colors.blue,
            ),
            title: Text(item['dispositivo'] ?? "Sensor"),
            subtitle: Text(
              DateFormat('HH:mm - d MMM', 'es').format(date.toLocal()),
            ),
            trailing: Text(
              "${g.toStringAsFixed(1)}G",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        );
      }, childCount: _caidas.length),
    );
  }
}
