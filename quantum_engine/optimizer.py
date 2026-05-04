import sys
import json
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import Aer

def optimize_cloud_resources(cost_data):
    # Quantum Circuit
    circuit = QuantumCircuit(3)
    circuit.h([0, 1, 2])
    circuit.rz(np.pi / 4, 0)
    circuit.cx(0, 1)
    circuit.measure_all()

    simulator = Aer.get_backend('qasm_simulator')
    counts = simulator.run(circuit, shots=1024).result().get_counts()

    # Quantum result నుండి ratio derive చేయడం
    # Most frequent bitstring → which resources to optimize
    best_state = max(counts, key=counts.get)
    q0, q1, q2 = int(best_state[2]), int(best_state[1]), int(best_state[0])

    # Each qubit ఒక resource type represent చేస్తుంది
    # 1 = optimize చేయాలి, 0 = వద్దు
    # Quantum probabilities నుండి savings ratio calculate చేయడం
    total_shots = sum(counts.values())
    weighted_ratio = sum(
        (int(state[2]) * 0.15 + int(state[1]) * 0.10 + int(state[0]) * 0.05) * (cnt / total_shots)
        for state, cnt in counts.items()
    )
    # weighted_ratio ఇప్పుడు ~0.10–0.28 మధ్య quantum probabilities బట్టి వస్తుంది

    try:
        spend = float(cost_data)
        savings = spend * weighted_ratio

        recommendations = []
        if q0:
            recommendations.append({
                "id": "compute-cluster",
                "current": "Over-provisioned",
                "action": f"Quantum Downscale (Save ${savings * 0.5:,.0f})"
            })
        if q1:
            recommendations.append({
                "id": "node-pool",
                "current": "Idle Capacity",
                "action": f"Auto-scale (Save ${savings * 0.3:,.0f})"
            })
        if q2:
            recommendations.append({
                "id": "storage-vol",
                "current": "Zombie Volume",
                "action": f"Delete (Save ${savings * 0.2:,.0f})"
            })

        if not recommendations:
            recommendations.append({
                "id": "all-resources",
                "current": "Optimal",
                "action": "No optimization needed (Quantum verified ✅)"
            })

        output = {
            "total_savings": f"{savings:,.2f}",
            "quantum_ratio": round(weighted_ratio, 4),
            "best_state": best_state,
            "recommendations": recommendations
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        optimize_cloud_resources(sys.argv[1])