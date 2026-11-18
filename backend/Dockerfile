# Multi-stage build for .NET 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ["JobAgent.sln", "./"]
COPY ["src/JobAgent.Domain/JobAgent.Domain.csproj", "src/JobAgent.Domain/"]
COPY ["src/JobAgent.Application/JobAgent.Application.csproj", "src/JobAgent.Application/"]
COPY ["src/JobAgent.Infrastructure/JobAgent.Infrastructure.csproj", "src/JobAgent.Infrastructure/"]
COPY ["src/JobAgent.API/JobAgent.API.csproj", "src/JobAgent.API/"]

RUN dotnet restore "JobAgent.sln"

COPY . .
WORKDIR "/src/src/JobAgent.API"
RUN dotnet build "JobAgent.API.csproj" -c Release -o /app/build
RUN dotnet publish "JobAgent.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "JobAgent.API.dll"]
