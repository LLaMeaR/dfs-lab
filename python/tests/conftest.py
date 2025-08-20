# pytest가 tests/ 하위에서 실행될 때, 상위 폴더(=모듈이 있는 python/)를 import 경로에 추가
import os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
