"""CRUD endpoints for data source demo (Req 21)."""

import math

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/api/crud", tags=["crud"])

# In-memory store
_store: dict[int, dict] = {
    1: {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "department": "Engineering",
        "salary": 95000,
    },
    2: {
        "id": 2,
        "name": "Bob Smith",
        "email": "bob@example.com",
        "department": "Marketing",
        "salary": 72000,
    },
    3: {
        "id": 3,
        "name": "Carol White",
        "email": "carol@example.com",
        "department": "HR",
        "salary": 68000,
    },
    4: {
        "id": 4,
        "name": "David Brown",
        "email": "david@example.com",
        "department": "Sales",
        "salary": 81000,
    },
    5: {
        "id": 5,
        "name": "Eve Davis",
        "email": "eve@example.com",
        "department": "Engineering",
        "salary": 102000,
    },
}
_next_id = 6


VALID_DEPARTMENTS = {"Engineering", "Marketing", "HR", "Sales", "Finance", "Operations"}


class EmployeeCreate(BaseModel):
    name: str
    email: str
    department: str
    salary: float

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name must not be empty")
        return v.strip()

    @field_validator("email")
    @classmethod
    def email_format(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format")
        return v.strip().lower()

    @field_validator("department")
    @classmethod
    def valid_department(cls, v: str) -> str:
        if v not in VALID_DEPARTMENTS:
            raise ValueError(
                f"Department must be one of: {', '.join(sorted(VALID_DEPARTMENTS))}"
            )
        return v

    @field_validator("salary")
    @classmethod
    def salary_positive(cls, v: float) -> float:
        if not math.isfinite(v):
            raise ValueError("Salary must be a finite number")
        if v < 0:
            raise ValueError("Salary must not be negative")
        return v


class EmployeeUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    department: str | None = None
    salary: float | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Name must not be empty")
        return v.strip() if v else v

    @field_validator("email")
    @classmethod
    def email_format(cls, v: str | None) -> str | None:
        if v is not None and ("@" not in v or "." not in v.split("@")[-1]):
            raise ValueError("Invalid email format")
        return v.strip().lower() if v else v

    @field_validator("department")
    @classmethod
    def valid_department(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_DEPARTMENTS:
            raise ValueError(
                f"Department must be one of: {', '.join(sorted(VALID_DEPARTMENTS))}"
            )
        return v

    @field_validator("salary")
    @classmethod
    def salary_positive(cls, v: float | None) -> float | None:
        if v is not None:
            if not math.isfinite(v):
                raise ValueError("Salary must be a finite number")
            if v < 0:
                raise ValueError("Salary must not be negative")
        return v


@router.get("/employees")
async def list_employees():
    return list(_store.values())


@router.post("/employees", status_code=201)
async def create_employee(emp: EmployeeCreate):
    global _next_id
    row = {"id": _next_id, **emp.model_dump()}
    _store[_next_id] = row
    _next_id += 1
    return row


@router.patch("/employees/{emp_id}")
async def update_employee(emp_id: int, emp: EmployeeUpdate):
    if emp_id not in _store:
        raise HTTPException(status_code=404, detail="Employee not found")
    updates = emp.model_dump(exclude_unset=True)
    _store[emp_id].update(updates)
    return _store[emp_id]


@router.delete("/employees/{emp_id}")
async def delete_employee(emp_id: int):
    if emp_id not in _store:
        raise HTTPException(status_code=404, detail="Employee not found")
    deleted = _store.pop(emp_id)
    return {"deleted": deleted}


@router.post("/employees/reset")
async def reset_employees():
    global _next_id, _store
    _store = {
        1: {
            "id": 1,
            "name": "Alice Johnson",
            "email": "alice@example.com",
            "department": "Engineering",
            "salary": 95000,
        },
        2: {
            "id": 2,
            "name": "Bob Smith",
            "email": "bob@example.com",
            "department": "Marketing",
            "salary": 72000,
        },
        3: {
            "id": 3,
            "name": "Carol White",
            "email": "carol@example.com",
            "department": "HR",
            "salary": 68000,
        },
        4: {
            "id": 4,
            "name": "David Brown",
            "email": "david@example.com",
            "department": "Sales",
            "salary": 81000,
        },
        5: {
            "id": 5,
            "name": "Eve Davis",
            "email": "eve@example.com",
            "department": "Engineering",
            "salary": 102000,
        },
    }
    _next_id = 6
    return {"status": "reset", "count": len(_store)}
