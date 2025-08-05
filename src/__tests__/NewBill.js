/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

jest.mock("../app/store", () => ({
  __esModule: true,
  default: {
    bills: () => mockStore.bills()
  }
}))

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })

  describe("When I am on NewBill Page", () => {
    test("Then the new bill form should be rendered", () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      const form = screen.getByTestId("form-new-bill")
      expect(form).toBeTruthy()
    })

    test("Then I can upload a valid image file", async () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBill = new NewBill({
        document, onNavigate: window.onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileInput = screen.getByTestId("file")
      fileInput.addEventListener("change", handleChangeFile)

      const file = new File(["image"], "image.png", { type: "image/png" })
      userEvent.upload(fileInput, file)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.files[0].name).toBe("image.png")
    })

    test("Then I can submit the form and POST new bill", async () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBill = new NewBill({
        document, onNavigate: window.onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const form = screen.getByTestId("form-new-bill")
      const fileInput = screen.getByTestId("file")

      const file = new File(["image"], "image.jpg", { type: "image/jpeg" })
      userEvent.upload(fileInput, file)

      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Taxi Paris" } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-01-01" } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "45" } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "10" } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "trajet client" } })

      const handleSubmit = jest.fn(newBill.handleSubmit)
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  })
})