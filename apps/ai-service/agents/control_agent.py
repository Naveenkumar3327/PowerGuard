"""
Agent 5: Machine Control Agent
Translates approved optimization recommendations into strictly SAFE SIMULATED commands.
Implements multi-layer industrial safety interlocks to guarantee digital-twin isolation.
"""
from datetime import datetime
from typing import Dict, Any, Optional

class MachineControlAgent:
    def __init__(self):
        self.name = "MachineControlAgent"

    def generate_simulated_command(
        self,
        action: str,
        machine_id: str,
        machine_state: Dict[str, Any],
        source: str = "OptimizationAgent"
    ) -> Dict[str, Any]:
        """
        Validates safety constraints and produces an isolated simulated machine command.
        """
        priority = machine_state.get("productionPriority", "MEDIUM")
        current_status = machine_state.get("status", "RUNNING")

        # Safety Interlock 1: Never issue hardware packets; always mark simulation=True
        is_simulation = True

        # Safety Interlock 2: Critical machine protection
        if priority == "CRITICAL" and action in ["STOP_MACHINE", "ENTER_STANDBY"]:
            return {
                "success": False,
                "error": f"Safety Interlock Block: Automatic shutdown/standby rejected for CRITICAL machine {machine_id}",
                "simulation": True,
                "command": None
            }

        # Safety Interlock 3: Maintenance / Fault protection
        if current_status == "MAINTENANCE" and action in ["START_MACHINE", "INCREASE_LOAD"]:
            return {
                "success": False,
                "error": f"Safety Interlock Block: Cannot start machine {machine_id} currently under physical maintenance",
                "simulation": True,
                "command": None
            }

        if current_status == "FAULT" and action not in ["RESET_FAULT"]:
            return {
                "success": False,
                "error": f"Safety Interlock Block: Machine {machine_id} is in FAULT status. Clear fault first.",
                "simulation": True,
                "command": None
            }

        # Format Safe Command Payload
        command_payload = {
            "machineId": machine_id,
            "command": action,
            "source": source,
            "simulation": is_simulation,
            "status": "APPROVED_FOR_SIMULATION",
            "timestamp": datetime.utcnow().isoformat(),
            "targetState": self._map_action_to_state(action, machine_state)
        }

        return {
            "success": True,
            "command": command_payload,
            "simulation": True,
            "message": f"Safe simulated command [{action}] dispatched to Digital Twin for {machine_id}"
        }

    def _map_action_to_state(self, action: str, current_state: Dict[str, Any]) -> Dict[str, Any]:
        target = {}
        if action == "ENTER_STANDBY":
            target["status"] = "STANDBY"
            target["loadPercentage"] = 2.0
            target["targetPowerKw"] = max(0.4, current_state.get("ratedPowerKw", 30.0) * 0.04)
        elif action == "EXIT_STANDBY":
            target["status"] = "RUNNING"
            target["loadPercentage"] = 50.0
            target["targetPowerKw"] = current_state.get("ratedPowerKw", 30.0) * 0.50
        elif action == "STOP_MACHINE":
            target["status"] = "IDLE"
            target["loadPercentage"] = 0.0
            target["targetPowerKw"] = 0.5
        elif action == "START_MACHINE":
            target["status"] = "RUNNING"
            target["loadPercentage"] = 60.0
            target["targetPowerKw"] = current_state.get("ratedPowerKw", 30.0) * 0.60
        elif action == "REDUCE_LOAD":
            current_load = current_state.get("loadPercentage", 80.0)
            target["loadPercentage"] = max(20.0, current_load * 0.75)
            target["targetPowerKw"] = current_state.get("powerKw", 20.0) * 0.75
        elif action == "INCREASE_LOAD":
            current_load = current_state.get("loadPercentage", 40.0)
            target["loadPercentage"] = min(95.0, current_load * 1.25)
            target["targetPowerKw"] = min(current_state.get("ratedPowerKw", 30.0), current_state.get("powerKw", 20.0) * 1.25)
        elif action == "RESET_FAULT":
            target["status"] = "IDLE"
            target["loadPercentage"] = 0.0
            target["targetPowerKw"] = 1.0
            target["temperature"] = 38.0
        return target
