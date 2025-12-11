"""Pellet placement algorithms for mazes."""

from .base import PelletPlacer
from .random_placer import RandomPelletPlacer
from .strategic_placer import StrategicPelletPlacer
from .classic_placer import ClassicPelletPlacer

__all__ = [
    'PelletPlacer',
    'RandomPelletPlacer',
    'StrategicPelletPlacer',
    'ClassicPelletPlacer'
]

