﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using MapConfig.Models;

namespace JNCCMapConfigEditor.Migrations
{
    [DbContext(typeof(MapConfigContext))]
    partial class MapConfigContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn)
                .HasAnnotation("ProductVersion", "2.2.1-servicing-10028")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            modelBuilder.Entity("MapConfig.Models.LayerConfigItem", b =>
                {
                    b.Property<long>("LayerConfigId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Comment");

                    b.Property<long>("LayerId");

                    b.Property<string>("Name");

                    b.Property<DateTime>("UpdatedDate");

                    b.Property<string>("Value");

                    b.HasKey("LayerConfigId");

                    b.HasIndex("LayerId");

                    b.ToTable("LayerConfigItem");
                });

            modelBuilder.Entity("MapConfig.Models.LayerItem", b =>
                {
                    b.Property<long>("LayerId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description");

                    b.Property<string>("Name");

                    b.Property<DateTime>("ReleaseDate");

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("LayerId");

                    b.ToTable("LayerItem");
                });

            modelBuilder.Entity("MapConfig.Models.MapConfigItem", b =>
                {
                    b.Property<long>("MapConfigId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Comment");

                    b.Property<long>("MapId");

                    b.Property<string>("Name");

                    b.Property<DateTime>("UpdatedDate");

                    b.Property<string>("Value");

                    b.HasKey("MapConfigId");

                    b.HasIndex("MapId");

                    b.ToTable("MapConfigItem");
                });

            modelBuilder.Entity("MapConfig.Models.MapItem", b =>
                {
                    b.Property<long>("MapId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description");

                    b.Property<string>("Name");

                    b.Property<DateTime>("ReleaseDate");

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("MapId");

                    b.ToTable("MapItem");
                });

            modelBuilder.Entity("MapConfig.Models.MapLayerItem", b =>
                {
                    b.Property<long>("MapLayerId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Comment");

                    b.Property<long>("LayerId");

                    b.Property<int>("LayerOrder");

                    b.Property<bool>("LayerVisible");

                    b.Property<long>("MapId");

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("MapLayerId");

                    b.HasIndex("LayerId");

                    b.HasIndex("MapId");

                    b.ToTable("MapLayerItem");
                });

            modelBuilder.Entity("MapConfig.Models.LayerConfigItem", b =>
                {
                    b.HasOne("MapConfig.Models.LayerItem", "LayerItem")
                        .WithMany("LayerConfigItems")
                        .HasForeignKey("LayerId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("MapConfig.Models.MapConfigItem", b =>
                {
                    b.HasOne("MapConfig.Models.MapItem", "MapItem")
                        .WithMany("MapConfigItems")
                        .HasForeignKey("MapId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("MapConfig.Models.MapLayerItem", b =>
                {
                    b.HasOne("MapConfig.Models.LayerItem", "LayerItem")
                        .WithMany()
                        .HasForeignKey("LayerId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("MapConfig.Models.MapItem", "MapItem")
                        .WithMany()
                        .HasForeignKey("MapId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
