# 基礎運行環境：使用 .NET 8.0 的 ASP.NET 映像檔作為基底
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# 建置階段：使用 .NET 8.0 SDK 映像檔進行編譯
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# 複製專案檔，並還原相依套件
COPY ["TeaTimeDemo.csproj", "./"]
RUN dotnet restore "TeaTimeDemo.csproj"
# 複製全部檔案，並發佈應用程式到 /app/publish 目錄
COPY . .
RUN dotnet publish "TeaTimeDemo.csproj" -c Release -o /app/publish

# 最終映像檔階段：從基底映像檔開始，複製編譯後的檔案
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
# 指定容器啟動時執行的命令（請確保 dll 名稱正確）
ENTRYPOINT ["dotnet", "TeaTimeDemo.dll"]
