#include <iostream>
#include <bitset>
#include <cstdlib>
#include "OlsApi.h"
#include "OlsDef.h"
#define READING_VALID 0x80000000
#define RES_CELSIUS 0x78000000
#define DIG_READOUT 0x7F0000

int main()
{
    if (InitializeOls())
    {
        // std::cout << "Ols Initialized" << std::endl;
    }
    else
    {
        std::cout << "{\"Error\": \"1: OLS did not initialized.\"}" << std::endl;
        exit(0);
    }

    if (GetDllStatus() == OLS_DLL_NO_ERROR)
    {
        // std::cout << "Dll Status OK" << std::endl;
    }
    else
    {
        std::cout << "{\"Error\": \"2: Dll error.\"}" << std::endl;
        exit(0);
    }

    if (IsMsr())
    {
        DWORD eax, edx, maxTemp;
        Rdmsr(0x1A2, &eax, &edx);
        maxTemp = ((eax & 0xFF0000) >> 16);
        Rdmsr(0x19C, &eax, &edx);
        std::cout << "{\"temperature\": " << maxTemp - ((eax & DIG_READOUT) >> 16) << "}" << std::endl;
    }
    else
    {
        std::cout << "{\"Error\": \"3: MSR is not supported.\"}" << std::endl;
        exit(0);
    }
}