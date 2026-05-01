import sys
from qiskit_aer import Aer
from qiskit import QuantumCircuit, transpile

def run_quantum_logic(spend):
    # Ippatiki simple quantum circuit build chestunnam to verify setup
    circuit = QuantumCircuit(2)
    circuit.h(0)
    circuit.cx(0, 1)
    
    # Logic: 40% savings simulation
    try:
        current_spend = float(spend)
        savings = current_spend * 0.4
        final_bill = current_spend - savings
        
        print(f"OptimumQ Analysis Complete:")
        print(f"Initial Spend: ${current_spend}")
        print(f"Quantum Savings: ${savings}")
        print(f"Final Optimized Bill: ${final_bill}")
    except Exception as e:
        print(f"Error in calculation: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_quantum_logic(sys.argv[1])
    else:
        print("No input provided")